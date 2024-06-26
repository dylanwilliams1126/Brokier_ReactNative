import React, { Component } from "react";
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Text, ScrollView } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { CommonActions } from '@react-navigation/native';

import styles from './SearchStyles';
import configs from "@constants/configs";
import { Icon, Input } from "react-native-elements";
import { colors } from "@constants/themes";
import { Header, Card } from "@components";
import { MapService, ListingsService } from "@modules/services";
import { isEmpty, isCurrency } from "@utils/functions";

export default class PropertiesSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      search: "",
      locations: null
    };
  }

  autoComplete(search) {
    global.search = search;
    this.setState({ search });
    setTimeout(() => {
      if (search == global.search) {
        this.searchResult(search);
      }
    }, 1000)
  }

  searchResult(search) {
    MapService.getPlaces(search).then(result => {
      this.setState({ locations: result.predictions });
    }).catch(error => console.log(error.message)).finally(() => this.setState({ loading: false }));

    ListingsService.getSearch(search).then(listings => {
      this.setState({ listings });
    }).catch(error => console.log(error.message)).finally(() => this.setState({ loading: false }));
  }

  async onDetail(id) {
    var listing = await ListingsService.getListingDetail(id);
    this.props.navigation.navigate('PropertiesDetail', { listing });
  }

  onMap(address) {
    MapService.getGeometry(address.replace(/ /g, '+')).then(result => {
      var region = result.results[0];
      global.region = {
        latitude: region.geometry.location.lat,
        longitude: region.geometry.location.lng,
        latitudeDelta: configs.latitudeDelta,
        longitudeDelta: configs.longitudeDelta
      }
      this.props.navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'App' }
          ]
        })
      )
    }).catch(error => console.log(error.message)).finally(() => this.setState({ loading: false }));

  }

  render() {
    const { search, locations, listings } = this.state;
    return (
      <View style={styles.container}>
        <Header style={{ paddingLeft: 10, paddingRight: 10 }}>
          <View style={styles.header}>
            <Icon name="left" type="antdesign" size={25} onPress={() => this.props.navigation.goBack()} />
            <View style={styles.searchBar}>
              <View style={styles.searchIcon}>
                <Icon name="search" type="material" size={25} />
              </View>
              <View style={{ marginLeft: 5 }}>
                <Input
                  editable={true}
                  autoFocus={true}
                  placeholder={"Search MLS number, Address, City"}
                  placeholderTextColor={colors.BLACK}
                  value={this.state.search}
                  inputContainerStyle={styles.inputContainerStyle}
                  containerStyle={styles.textInputStyle}
                  inputStyle={styles.inputTextStyle}
                  onChangeText={(value) => this.autoComplete(value)}
                />
              </View>
              <TouchableOpacity onPress={() => this.setState({ search: '' })}>
                <Icon name="closecircle" type="antdesign" size={18} color={colors.GREY.SECONDARY} />
              </TouchableOpacity>
            </View>
          </View>
        </Header>
        <ScrollView>
          <View style={styles.nearby}>
            <TouchableOpacity style={styles.nearbyButton} >
              <View style={{ width: 5 }} />
              <Icon name="location-searching" type="material" size={18} />
              <Text>{`Nearby`}</Text>
              <View style={{ width: 5 }} />
            </TouchableOpacity>
          </View>
          {!isEmpty(search) &&
            <Card index={21} style={styles.location}>
              <View style={{ width: '100%', marginTop: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>{`Locations`}</Text>
                {!isEmpty(locations) ? locations.map((location, key) => {
                  return (
                    <TouchableOpacity key={key} style={{ marginTop: 10, borderBottomWidth: 0.5, borderBottomColor: colors.GREY.PRIMARY }}
                      onPress={() => this.onMap(location.description)}>
                      <Text>{location.terms[0].value}</Text>
                      <Text>{location.description}</Text>
                    </TouchableOpacity>
                  )
                }) : <Text>{"Location not found"}</Text>}
              </View>
            </Card>
          }
          {!isEmpty(search) &&
            <Card index={22} style={styles.listings}>
              <View style={{ width: '100%' }}>
                <Text style={{ fontWeight: 'bold' }}>{`Listings`}</Text>
                {!isEmpty(listings) ? listings.map((listing, key) => {
                  return (
                    <TouchableOpacity key={key} style={{ marginTop: 10, borderBottomWidth: 0.5, borderBottomColor: colors.GREY.PRIMARY }}
                      onPress={() => this.onDetail(listing.id)}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text>{listing.streetNumber + " " + listing.streetName + " " + listing.streetSuffix}</Text>
                        <View style={{ width: 80, alignItems: 'center' }}>
                          <Text style={{ color: listing.lastStatus === 'Sus' ? colors.BLACK : listing.lastStatus === 'Exp' ? colors.BLACK : listing.lastStatus === 'Sld' ? colors.RED.PRIMARY : listing.lastStatus === 'Ter' ? colors.BLACK : listing.lastStatus === 'Dft' ? colors.GREEN.PRIMARY : listing.lastStatus === 'Lsd' ? colors.RED.PRIMARY : listing.lastStatus === 'Sc' ? colors.BLUE.PRIMARY : listing.lastStatus === 'Lc' ? colors.BLUE.PRIMARY : listing.lastStatus === 'Pc' ? colors.GREEN.PRIMARY : listing.lastStatus === 'Ext' ? colors.GREEN.PRIMARY : listing.lastStatus === 'New' ? colors.GREEN.PRIMARY : colors.BLACK }}>
                            {isCurrency(parseInt(listing.listPrice)).split('.')[0]}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text>{listing.city} {listing.state}</Text>
                        <View style={{ justifyContent: 'center', alignItems: 'center', width: 80, borderWidth: 0.5, borderColor: listing.lastStatus === 'Sus' ? colors.BLACK : listing.lastStatus === 'Exp' ? colors.BLACK : listing.lastStatus === 'Sld' ? colors.RED.PRIMARY : listing.lastStatus === 'Ter' ? colors.BLACK : listing.lastStatus === 'Dft' ? colors.GREEN.PRIMARY : listing.lastStatus === 'Lsd' ? colors.RED.PRIMARY : listing.lastStatus === 'Sc' ? colors.BLUE.PRIMARY : listing.lastStatus === 'Lc' ? colors.BLUE.PRIMARY : listing.lastStatus === 'Pc' ? colors.GREEN.PRIMARY : listing.lastStatus === 'Ext' ? colors.GREEN.PRIMARY : listing.lastStatus === 'New' ? colors.GREEN.PRIMARY : colors.BLACK }}>
                          <Text style={{ color: listing.lastStatus === 'Sus' ? colors.BLACK : listing.lastStatus === 'Exp' ? colors.BLACK : listing.lastStatus === 'Sld' ? colors.RED.PRIMARY : listing.lastStatus === 'Ter' ? colors.BLACK : listing.lastStatus === 'Dft' ? colors.GREEN.PRIMARY : listing.lastStatus === 'Lsd' ? colors.RED.PRIMARY : listing.lastStatus === 'Sc' ? colors.BLUE.PRIMARY : listing.lastStatus === 'Lc' ? colors.BLUE.PRIMARY : listing.lastStatus === 'Pc' ? colors.GREEN.PRIMARY : listing.lastStatus === 'Ext' ? colors.GREEN.PRIMARY : listing.lastStatus === 'New' ? colors.GREEN.PRIMARY : colors.BLACK }}>
                            {listing.lastStatus === 'Sus' ? 'Suspended' : listing.lastStatus === 'Exp' ? 'Expires' : listing.lastStatus === 'Sld' ? 'Sold' : listing.lastStatus === 'Ter' ? 'Terminated' : listing.lastStatus === 'Dft' ? 'Deal' : listing.lastStatus === 'Lsd' ? 'Leased' : listing.lastStatus === 'Sc' ? 'Sold Con' : listing.lastStatus === 'Lc' ? 'Leased Con' : listing.lastStatus === 'Pc' ? 'Price Change' : listing.lastStatus === 'Ext' ? 'Extended' : listing.lastStatus === 'New' ? 'For Sale' : null}
                          </Text>
                        </View>
                      </View>
                      <Text>{isEmpty(listing.numBedrooms) ? '' : listing.numBedrooms + ' Bedrooms | '}{isEmpty(listing.numBathrooms) ? '' : listing.numBathrooms + ' Baths | '}{isEmpty(listing.numGarageSpaces) ? '' : listing.numGarageSpaces + ' Garage | '}{isEmpty(listing.type) ? '' : listing.type}</Text>
                    </TouchableOpacity>
                  )
                }) : <Text>{"Listing not found"}</Text>}
              </View>
            </Card>
          }
          <View style={{ height: 350 }} />
        </ScrollView>
      </View>
    );
  }
}