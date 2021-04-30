import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';
import RBCarousel from "react-bootstrap-carousel";
import GoogleMapReact from 'google-map-react';

import { setLoading } from '../modules/redux/auth/actions';
import {
	PropertyDetail,
	PropertyHistories,
	PropertyDescription,
	PropertyPrices,
	PropertyProfile,
	PropertySimilar,
	PropertyImage,
	MarkerMain,
} from '../components';
import {
	getListingDetail,
	getDetailHistories,
	getDetailSimilars
} from '../modules/services/ListingsService';
import { isEmpty } from "../utils/functions";
import configs from "../constants/configs";

const Detail = (props) => {
	const dispatch = useDispatch();

	const [listing, setListing] = useState([]);
	// const [school, setSchool] = useState('All');
	const [histories, setHistories] = useState([]);
	const [similar, setSimilar] = useState('For Sale');
	const [similars, setSimilars] = useState([]);
	const [images, setImages] = useState([]);
	// const [rooms, setRooms] = useState([]);
	const [visible, setVisible] = useState(false);
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const getListing = async () => {
			dispatch(setLoading(true));
			var listingOne = await getListingDetail(props.match.params.id);
			setListing(listingOne);
			setImages(listingOne.images);
			dispatch(setLoading(false));
		}
		getListing();
	}, [props.match.params.id]);

	useEffect(() => {
		if (!isEmpty(listing)) {
			// dispatch(setLoading(true));
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
			getDetailHistories(listing.streetNumber, listing.streetName, listing.streetSuffix, listing.unitNumber)
				.then((response) => {
					setHistories(response);
				});
			getDetailSimilars(listing.latitude, listing.longitude, status, type, lastStatus, listing.propertyType, listing.numBedrooms)
				.then((response) => {
					setSimilars(response)
				});
			// getDetailRooms(listing.mlsNumber)
			// 	.then((rooms) => {
			// 		// dispatch(setLoading(false));
			// 		setRooms(rooms);
			// 	});
		}
	}, [listing, similar]);

	return (
		<div className='detail-wrapper'>
			<div className='detail-main-panel'>
				<div className='detail-left-panel'>
					{!isEmpty(listing) ? (
						<div className='detail-body'>
							<div className='detail-title-wrapper'>
								<span className='title'>{listing.streetNumber + " " + listing.streetName + " " + listing.streetSuffix.replace('St', 'Street')} {!isEmpty(listing.unitNumber) && `#${listing.unitNumber}`}</span>
								<span className='neighborhood'>{listing.neighborhood} {listing.city}</span>
							</div>
							<div className='detail-image-container'>
								<RBCarousel
									animation={true}
									autoplay={false}
									slideshowSpeed={7000}
									defaultActiveIndex={0}
									indicators={listing.images.split('#').length > 1 ? true : false}
									leftIcon={listing.images.split('#').length > 1 && <i className="fas fa-chevron-left" style={{ fontSize: '24px', color: 'white' }}></i>}
									rightIcon={listing.images.split('#').length > 1 && <i className="fas fa-chevron-right" style={{ fontSize: '24px', color: 'white' }}></i>}
									version={4}
								>
									{
										listing.images.split('#').map((image, key) => (
											<button key={key} className="detail-carousel-media-inner" onClick={() => {
												setIndex(key);
												setVisible(true);
											}}>
												<img src={configs.resURL + image} alt={listing.mlsNumber} style={{ maxWidth: "100%", maxHeight: '100%' }} />
											</button>
										))
									}
								</RBCarousel>
							</div>
							<PropertyDetail listing={listing} />
							<PropertyHistories histories={histories}
								onDetail={(id, streetNumber, streetName, streetSuffix, mlsNumber) => props.history.push(`/detail/${streetNumber}-${streetName}-${streetSuffix}/${mlsNumber}/${id}`)} />
							<div className='detail-map-wrapper'>
								<GoogleMapReact bootstrapURLKeys={{ key: 'AIzaSyDoi0kDoetjxsvsctCrRb99I5lu1GJMj_8', language: 'en', region: 'US' }}
									options={{ scrollwheel: false }}
									defaultZoom={17}
									defaultCenter={{ lat: listing.latitude, lng: listing.longitude }}
								>
									<MarkerMain
										lat={parseFloat(listing.latitude)}
										lng={parseFloat(listing.longitude)}
										item={[listing]}
										details={listing}
										onClick={() => console.log('OK')}
									/>
								</GoogleMapReact>
							</div>
							<PropertyDescription listing={listing} />
							<PropertyPrices listing={listing} />
							<PropertySimilar
								similar={similar}
								onSimilar={(similar) => setSimilar(similar)}
								similars={similars}
								onDetail={(id, streetNumber, streetName, streetSuffix, mlsNumber) => props.history.push(`/detail/${streetNumber}-${streetName}-${streetSuffix}/${mlsNumber}/${id}`)}
							/>
						</div>
					) : null}
				</div>
				{!isEmpty(listing) ? (
					<div className='detail-right-panel'>
						<PropertyProfile className='detail-profile' />
					</div>
				) : null}
			</div>
			<PropertyImage
				visible={visible}
				images={images}
				index={index}
				onClose={() => setVisible(false)}
			/>
		</div>
	)
}

export default withRouter(Detail);