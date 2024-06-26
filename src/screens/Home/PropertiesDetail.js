import React, { Component } from "react";
import { connect } from "react-redux";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Share } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import GoogleStaticMap from 'react-native-google-static-map';

import styles from './DetailStyles';
import configs from "@constants/configs";
import { Icon } from "react-native-elements";
import { colors } from "@constants/themes";
import { setLikes } from "@modules/redux/lists/actions";
import { Loading2, Header, ActionButtons, PropertyDetail, PropertyHistory, PropertyDescription, PropertySimilar, PropertySchools, PropertyPrices, PropertyProfile, PropertyQuestions } from "@components";
import { ListingsService } from "@modules/services";
import { isEmpty, isCurrency } from "@utils/functions";

class PropertiesDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      similar: 'For Sale',
      school: 'All',
      listing: null,
      histories: [],
      similars: [],
      images: []
    };
  }

  componentDidMount() {
    const { listing } = this.props.route.params;
    ListingsService.getDetailHistories(listing.streetNumber, listing.streetName, listing.streetSuffix, listing.unitNumber)
      .then((histories) => {
        this.setState({ histories });
      });
    var status = 'A';
    var type = 'Sale';
    var lastStatus = null;
    ListingsService.getDetailSimilars(listing.latitude, listing.longitude, status, type, lastStatus, listing.propertyType, listing.numBedrooms)
      .then((similars) => {
        this.setState({ similars });
      });
  }

  onSimilar(similar) {
    var status = 'A';
    var type = 'Sale';
    var lastStatus = null;
    if (similar === 'For Sale') {
      status = 'A';
      type = 'Sale';
      lastStatus = null;
    } else if (similar === 'Sold') {
      status = 'U';
      type = null;
      lastStatus = 'Sld';
    } else {
      status = 'U';
      type = null;
      lastStatus = 'Lsd';
    }
    this.setState({ loading: true });
    const { listing } = this.props.route.params;
    ListingsService.getDetailSimilars(listing.latitude, listing.longitude, status, type, lastStatus, listing.propertyType, listing.numBedrooms)
      .then((similars) => {
        this.setState({ loading: false, similar, similars });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  onViewing(listingId, agentUniqueId, userId) {
    this.setState({ loading: true });
    ListingsService.setViewings(listingId, agentUniqueId, userId).then((res) => {
      alert('Success');
      this.setState({ loading: false });
    }).catch((err) => {
      this.setState({ loading: false });
    });
  }

  onLike(id) {
    ListingsService.setLike(this.props.user.id, id).then((response) => {
      this.props.setLikes(response);
    });
  }

  async onShare(id) {
    const user = this.props.user;
    var listing = await ListingsService.getListingDetail(id);
    var status = listing.lastStatus === 'Sus' ? 'Suspended' : listing.lastStatus === 'Exp' ? 'Expires' : listing.lastStatus === 'Sld' ? 'Sold' : listing.lastStatus === 'Ter' ? 'Terminated' : listing.lastStatus === 'Dft' ? 'Deal' : listing.lastStatus === 'Lsd' ? 'Leased' : listing.lastStatus === 'Sc' ? 'Sold Con' : listing.lastStatus === 'Lc' ? 'Leased Con' : listing.lastStatus === 'Pc' ? 'Price Change' : listing.lastStatus === 'Ext' ? 'Extended' : listing.lastStatus === 'New' ? 'For Sale' : null;
    var image = `${configs.resURL}${listing.images.split('#')[0]}`;

    if (Platform.OS === 'ios') {
      var subject = `Brokier - ${listing.streetNumber} ${listing.streetName} ${listing.streetSuffix} Home Detail`;
      var message = `${listing.streetNumber} ${listing.streetName} ${listing.streetSuffix}: ${status}, ${isCurrency(listing.listPrice).split('.')[0]}, ${listing.neighborhood} ${listing.city}, ${listing.mlsNumber} - Brokier${'\n'}`;
      if (!isEmpty(user) && user.user_role === 'regular') {
        message += `https://brokier-0916.web.app/home/AthenaHein0916/${listing.streetNumber}-${listing.streetName.replace(' ', '-')}-${listing.streetSuffix}/${listing.mlsNumber}/${id}`;
      } else {
        message += `https://brokier-0916.web.app/home/${user.unique_id}/${listing.streetNumber}-${listing.streetName.replace(' ', '-')}-${listing.streetSuffix}/${listing.mlsNumber}/${id}`;
      }

      Share.share({ message }, { subject });
    } else {
      var dialogTitle = `Brokier - ${listing.streetNumber} ${listing.streetName} ${listing.streetSuffix} Home Detail`;
      var message = `${listing.streetNumber} ${listing.streetName} ${listing.streetSuffix}: ${status}, ${isCurrency(listing.listPrice).split('.')[0]}, ${listing.neighborhood} ${listing.city}, ${listing.mlsNumber} - Brokier${'\n'}`;
      var title = `Brokier - ${listing.streetNumber} ${listing.streetName} ${listing.streetSuffix} Home Detail`;

      if (!isEmpty(user) && user.user_role === 'regular') {
        message += `https://brokier-0916.web.app/home/AthenaHein0916/${listing.streetNumber}-${listing.streetName.replace(' ', '-')}-${listing.streetSuffix}/${listing.mlsNumber}/${id}`;
      } else {
        message += `https://brokier-0916.web.app/home/${user.unique_id}/${listing.streetNumber}-${listing.streetName.replace(' ', '-')}-${listing.streetSuffix}/${listing.mlsNumber}/${id}`;
      }

      Share.share({ message, title }, { dialogTitle });
    }
  };

  render() {
    const { listing } = this.props.route.params;
    return (
      <View style={styles.container}>
        <Loading2 loading={this.state.loading} />
        <Header style={{ backgroundColor: colors.GREY.PRIMARY, paddingRight: 10 }}>
          <View style={styles.header}>
            <View style={styles.topBar}>
              <View style={{ flexDirection: 'row', justifyContent: "center", alignItems: "flex-start" }}>
                <View style={{ width: 30, height: 30, marginTop: -5, marginLeft: -5, justifyContent: 'center', alignItems: 'center' }}>
                  <Icon name="keyboard-arrow-left" type="material" size={40} onPress={() => this.props.navigation.goBack()} />
                </View>
                <View style={{ alignItems: "flex-start", marginLeft: 10 }}>
                  <Text style={{ fontWeight: 'bold' }}>{listing.streetNumber + " " + listing.streetName + " " + listing.streetSuffix.replace('St', 'Street')} {!isEmpty(listing.unitNumber) && `#${listing.unitNumber}`}</Text>
                  <Text style={{ fontSize: 11 }}>{listing.neighborhood} {listing.city}</Text>
                </View>
              </View>
              <ActionButtons
                like={this.props.likes.indexOf(listing.id) > -1}
                onLogin={() => this.props.navigation.push("Auth")}
                onLike={() => this.onLike(listing.id)}
                onShare={() => this.onShare(listing.id)}
              />
            </View>
          </View>
        </Header>
        <ScrollView style={styles.container}>
          <PropertyDetail listing={listing} />
          <PropertyHistory navigation={this.props.navigation} histories={this.state.histories} />
          <GoogleStaticMap
            latitude={listing.latitude.toString()}
            longitude={listing.longitude.toString()}
            zoom={13}
            size={{ width: wp("100%"), height: 250 }}
            apiKey={configs.google_map_key}
          />
          <PropertyDescription listing={listing} loading={() => this.setState({ loading: !this.state.loading })} />
          <PropertyPrices listing={listing} />
          {
            (this.props.logged && !isEmpty(this.props.user.agent_unique_id)) && (
              <PropertyProfile navigation={this.props.navigation} userInfo={this.props.user} />
            )
          }
          <PropertySimilar
            navigation={this.props.navigation}
            similar={this.state.similar}
            onSimilar={(similar) => this.onSimilar(similar)}
            similars={this.state.similars}
          />
          <View style={{ height: 150 }} />
        </ScrollView>
        <View style={styles.bottomBar}>
          <View style={{ width: wp("100%"), paddingHorizontal: 20, height: 60 }}>
            {(this.props.logged && this.props.user.user_role == 'agent') ? (
              <TouchableOpacity style={{ justifyContent: "center", alignItems: "center", width: "100%", height: 35, borderRadius: 5, backgroundColor: '#E1E1E1' }}

              >
                <Text style={{ fontSize: 16, fontWeight: "bold", color: '#434343', }} >
                  {`Connections`}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={{ justifyContent: "center", alignItems: "center", width: "100%", height: 35, borderRadius: 5, backgroundColor: colors.RED.PRIMARY }}
                onPress={() => this.onViewing(listing.id, this.props.user.agent_unique_id, this.props.user.id)}
              >
                <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.WHITE, }} >
                  {`Schedule Viewing`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    logged: state.auth.logged,
    user: state.auth.user_info,
    likes: state.lists.likes
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setLikes: (data) => dispatch(setLikes(data))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PropertiesDetail);
