import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import './index.css';
import App from './App';
import { recipesReducer } from './store/reducers/recipesReducer';
import { authReducer } from './store/reducers/authReducer';
import { modalReducer } from './store/reducers/modalReducer';

const rootReducer = combineReducers({
  recipes: recipesReducer,
  auth: authReducer,
  modal: modalReducer,
});

const store = createStore(
	rootReducer,
	composeWithDevTools(applyMiddleware(ReduxThunk))
);

ReactDOM.render(
	// <React.StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	// </React.StrictMode>
  ,
	document.getElementById('root')
);

reportWebVitals();
