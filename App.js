import React, { useEffect, Component } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@modules";
import AppContainer from "@navigations";

import configs from "@constants/configs";
import i18n from "@utils/i18n";
i18n.setI18nConfig();

console.disableYellowBox = true;

global.homeUrl = {
	agentId: undefined,
	address: undefined,
	mlsNumber: undefined,
	listingId: undefined
}

global.listings = [];
global.details = [];
global.zoom = 10;
global.region = {
  latitude: configs.latitude,
  longitude: configs.longitude,
  latitudeDelta: configs.latitudeDelta,
  longitudeDelta: configs.longitudeDelta
};
global.location = null;
global.coordinates = [];
global.description = '';
global.badge = 0;
global.filters = {
  type: 'Sale',
  lastStatus: null,
  propertyType: {
    allTypes: false,
    condoApartment: false,
    condoTown: false,
    detached: false,
    duplex: false,
    freeholdTown: false,
    land: false,
    multiFamily: false,
    semiDetached: false,
  },
  price: {
    minPrice: 0,
    maxPrice: 5000000,
  },
  daysOnMarket: 0,
  soldInLast: 180,
  rooms: {
    bed: 0,
    bath: 0,
    garage: 0,
    parking: 0,
  },
  size: {
    minSize: 0,
    maxSize: 5000,
  },
  age: {
    minAge: 0,
    maxAge: 100,
  },
  condo: {
    minCondo: 0,
    maxCondo: 5000
  }
};
global.marker = false;

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppContainer />
        </PersistGate>
      </Provider>
    );
  }
}
