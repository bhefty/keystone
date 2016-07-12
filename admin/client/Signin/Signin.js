/**
 * The actual Sign In view, with the login form
 */

import assign from 'object-assign';
import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';

import Alert from './components/Alert';
import Brand from './components/Brand';
import UserInfo from './components/UserInfo';
import LoginForm from './components/LoginForm';

import Analytics from '../utils/Analytics';

var SigninView = React.createClass({
	getInitialState () {
		return {
			email: '',
			password: '',
			isAnimating: false,
			isInvalid: false,
			invalidMessage: '',
			signedOut: window.location.search === '?signedout',
		};
	},
	componentDidMount () {
		Analytics.init();
		Analytics.sendEvent('Page', 'render', 'Signin');
		// Focus the email field when we're mounted
		if (this.refs.email) {
			ReactDOM.findDOMNode(this.refs.email).select();
		}
	},
	handleInputChange (e) {
		// Set the new state when the input changes
		const newState = {};
		newState[e.target.name] = e.target.value;
		this.setState(newState);
	},
	handleSubmit (e) {
		e.preventDefault();
		// If either password or mail are missing, show an error
		if (!this.state.email || !this.state.password) {
			return this.displayError('Please enter an email address and password to sign in.');
		}

		xhr({
			url: `${Keystone.adminPath}/api/session/signin`,
			method: 'post',
			json: {
				email: this.state.email,
				password: this.state.password,
			},
			headers: assign({}, Keystone.csrf.header),
		}, (err, resp, body) => {
			if (err || body && body.error) {
				return body.error === 'invalid csrf'
					? this.displayError('Something went wrong; please refresh your browser and try again.')
					: this.displayError('The email and password you entered are not valid.');
			} else {
				// Redirect to where we came from or to the default admin path
				if (Keystone.redirect) {
					top.location.href = Keystone.redirect;
				} else {
					top.location.href = this.props.from ? this.props.from : Keystone.adminPath;
				}
			}
		});
	},
	/**
	 * Display an error message
	 *
	 * @param  {String} message The message you want to show
	 */
	displayError (message) {
		this.setState({
			isAnimating: true,
			isInvalid: true,
			invalidMessage: message,
		});
		setTimeout(this.finishAnimation, 750);
	},
	// Finish the animation and select the email field
	finishAnimation () {
		// TODO isMounted was deprecated, find out if we need this guard
		if (!this.isMounted()) return;
		if (this.refs.email) {
			ReactDOM.findDOMNode(this.refs.email).select();
		}
		this.setState({
			isAnimating: false,
		});
	},
	render () {
		const boxClassname = classnames('auth-box', {
			'auth-box--has-errors': this.state.isAnimating,
		});
		return (
			<div className="auth-wrapper">
				<Alert
					isInvalid={this.state.isInvalid}
					signedOut={this.state.signedOut}
					invalidMessage={this.state.invalidMessage}
				/>
				<div className={boxClassname}>
					<h1 className="u-hidden-visually">{this.props.brand ? this.props.brand : 'Keystone'} Sign In </h1>
					<div className="auth-box__inner">
						<Brand
							logo={this.props.logo}
							brand={this.props.brand}
						/>
						<UserInfo
							user={this.props.user}
							userCanAccessKeystone={this.props.userCanAccessKeystone}
						/>
						<LoginForm
							user={this.props.user}
							handleSubmit={this.handleSubmit}
							handleInputChange={this.handleInputChange}
							email={this.state.email}
							password={this.state.password}
							animating={this.state.animating}
						/>
					</div>
				</div>
				<div className="auth-footer">
					<span>Powered by </span>
					<a href="http://keystonejs.com" target="_blank" title="The Node.js CMS and web application platform (new window)">KeystoneJS</a>
				</div>
			</div>
		);
	},
});


module.exports = SigninView;