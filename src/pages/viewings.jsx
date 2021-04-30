import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { setLoading } from '../modules/redux/auth/actions';
import { setLikes } from '../modules/redux/lists/actions';
import { setModal } from '../modules/redux/mobile/actions';
import { PropertyProfile, SavedItem, PropertyModal, PropertyImage } from '../components';
import { getViewings, getLike, getListingDetail, setLike, getSearches } from '../modules/services/ListingsService';
import { isEmpty } from "../utils/functions";

const Viewings = (props) => {
	const dispatch = useDispatch();
	const { user_info } = useSelector(state => state.auth);
	const { likes } = useSelector(state => state.lists);

	const [listings, setListings] = useState([]);
	const [offset, setOffset] = useState(0);
	const [visible, setVisible] = useState(false);
	const [detail, setDetail] = useState(null);
	const [imageVisible, setImageVisible] = useState(false);
	const [images, setImages] = useState([]);
	const [imageIndex, setImageIndex] = useState(0);

	useEffect(() => {
		dispatch(setModal(false));
		dispatch(setLoading(true));
		const getReferred = async () => {
			var listingsTemp = await getViewings(props.match.params.agentId, props.match.params.userId, offset);
			setListings([...listings, ...listingsTemp]);
			var likes = await getLike(user_info.id);
			dispatch(setLikes(likes));
			dispatch(setLoading(false));
		}
		getReferred();
	}, [offset]);

	const onDetail = async (id) => {
		dispatch(setLoading(true));
		var listing = await getListingDetail(id);
		setDetail(listing);
		dispatch(setLoading(false));
		setVisible(true);
	}

	const onLike = async (id) => {
		await setLike(user_info.id, id).then((response) => {
			dispatch(setLikes(response));
		})
	}

	return (
		<div className='saved-wrapper'>
			<div className='saved-main-panel'>
				<div className='saved-left-panel'>
					<div className='saved-body'>
						<div className='saved-left-list'>
							{!isEmpty(listings) && listings.map((listing, key) => (
								<SavedItem
									key={key}
									listing={listing}
									likes={likes}
									onLike={(id) => onLike(id)}
									onClick={(item) => onDetail(item.id)}
								/>
							))}
							{!isEmpty(listings) && (
								<div className='saved-load-more'>
									<button className='saved-load-more-button' onClick={() => {
										setOffset(offset + 1);
										dispatch(setLoading(true));
									}}><span>Load more</span></button>
								</div>)}
						</div>
					</div>
				</div>
				<div className='saved-right-panel'>
					<PropertyProfile className='saved-profile' />
				</div>
			</div>
			<PropertyModal
				visible={visible}
				listing={detail}
				onClose={() => setVisible(false)}
				onDetail={(id, streetNumber, streetName, streetSuffix, mlsNumber) => {
					const win = window.open(`/detail/${streetNumber}-${streetName}-${streetSuffix}/${mlsNumber}/${id}`, '_blank');
					win.focus();
				}}
				onImage={(images, index) => {
					setImages(images);
					setImageIndex(index);
					setImageVisible(true);
				}}
			/>
			<PropertyImage
				visible={imageVisible}
				images={images}
				index={imageIndex}
				onClose={() => setImageVisible(false)}
			/>
		</div>
	)
}

export default withRouter(Viewings);