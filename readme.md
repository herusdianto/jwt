# JWT Encoder & Decoder

A simple, fast, and privacy-focused JWT (JSON Web Token) tool that runs 100% client-side. No data is sent to any server.

## Features

### Decode JWT
- Paste and decode any JWT token instantly
- View Header, Payload, and Signature separately
- Color-coded sections for easy identification
- Algorithm badge display
- Token expiry status (Valid/Expired)
- Copy individual sections or all data
- Auto-decode as you type

### Encode JWT
- Create JWT tokens from custom header and payload
- Support for HS256, HS384, and HS512 algorithms
- Automatic header generation based on selected algorithm
- Secret key input with show/hide toggle
- Uses Web Crypto API for secure HMAC signature generation
- Copy generated JWT with one click

## Privacy
All processing is done in your browser using the Web Crypto API. No data is sent to any server.

## Built With
- Web Crypto API - Secure signature generation
- Vanilla JavaScript (no framework)

## Demo
You can see the demo [here](https://jwt-heru.web.app/)

## Author
Created by [Heru Rusdianto](https://herusdianto.github.io/) with AI Assistance

