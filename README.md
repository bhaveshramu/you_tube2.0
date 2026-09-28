# YourTube 🎬

### A Feature-Rich YouTube-Inspired Video Streaming Platform

**YourTube** is a full-stack video streaming platform developed as an enhanced YouTube-inspired application. The platform provides video browsing, comments, subscriptions, controlled downloads, personalized themes, secure login verification, a custom video player, and a real-time Watch Party experience.

The project combines a modern **Next.js fronteYourTube 🎬
Full-Stack YouTube-Inspired Video Platform
YourTube is a full-stack video streaming platform developed by extending the existing training project with additional internship features and functionality.

The application provides video-related features such as comments, controlled downloads, subscription management, secure login verification, a custom video player, and a real-time Watch Party experience.

🌐 Live Project
Live Application:
https://yourtube-peach-zeta.vercel.app

Backend API:
https://yourtube-backend-ezta.onrender.com

GitHub Repository:
https://github.com/bhaveshramu/you_tube2.0

The frontend is deployed on Vercel and the backend is deployed on Render.

📌 Project Overview
YourTube is designed as a YouTube-inspired web application with additional functionality developed during the internship.

The internship features were implemented as extensions to the same training project rather than creating a separate project.

Main capabilities
Google authentication

Additional OTP verification for new login situations

Personalized light/dark theme

Enhanced comment system

Subscription plans

Razorpay test payment integration

Subscription-based download limits

Custom video player

Watch Party

Real-time chat

WebRTC audio/video communication

Screen sharing

Cloudinary media storage

OTP and subscription emails using MailerSend

Responsive desktop, tablet, and mobile interface

🎯 Internship Tasks Implemented
The following internship tasks were implemented as additional features on the existing training project.

Task	Implementation
1. Enhanced Comment System	Comment functionality integrated into the video experience
2. Controlled Video Download	Subscription-based daily download limits
3. Subscription & Download Management	Bronze, Silver and Gold plans with Razorpay test payments
4. Personalized Theme & Login Security	Automatic/manual theme and new-device/city/state OTP verification
5. Custom Video Player	Custom playback controls, seeking, fullscreen, volume and mobile gestures
6. Watch Party	Synchronized playback, real-time chat, WebRTC audio/video and screen sharing
✨ Features
1. 🔐 Google Authentication
Users can sign in using their Google account through Firebase Authentication.

Authentication flow
User
  ↓
Google Sign In
  ↓
Firebase Authentication
  ↓
YourTube Backend
  ↓
User Verification
  ↓
Login Successful
Firebase handles Google authentication while user information is maintained through the application backend and MongoDB.

2. 🛡️ New Login Security with OTP
YourTube provides an additional verification layer when login information indicates a new device, city, or state.

The backend compares login information with the user's stored information.

If a new login situation is detected:

Login
  ↓
Compare Device / City / State
  ↓
New information detected?
  ↓
Generate OTP
  ↓
Send OTP through MailerSend
  ↓
User enters OTP
  ↓
Login completed
The OTP is valid for 5 minutes.

After successful verification, the user's login information is updated.

3. 🎨 Personalized Theme
YourTube supports both light and dark themes.

The application provides:

Automatic theme selection

Manual theme selection

Saved theme preference

The automatic theme uses the configured time-based behavior, while users can manually select their preferred theme.

4. 💬 Enhanced Comment System
Users can interact with videos through the comment system.

The system supports:

Adding comments

Viewing comments

User-related comment information

Persistent comment storage

Comments are handled through the backend and database.

5. ⬇️ Controlled Video Downloads
Video download access depends on the user's subscription plan.

Download limits
Plan	Daily Download Limit
Free	1
Bronze	5
Silver	15
Gold	Unlimited
The backend checks the user's subscription plan and download usage before allowing a download.

Download flow
User requests download
        ↓
Backend checks subscription plan
        ↓
Check daily download count
        ↓
Limit available?
    ↓          ↓
   Yes         No
    ↓           ↓
Download     Request rejected
The restriction is enforced on the backend rather than relying only on frontend controls.

6. 💳 Subscription System
YourTube provides three paid subscription plans:

Bronze

Silver

Gold

Payments are handled using Razorpay Test Mode.

Subscription flow
Select Plan
    ↓
Create Razorpay Order
    ↓
Razorpay Checkout
    ↓
Complete Test Payment
    ↓
Backend Payment Verification
    ↓
Update User Plan
    ↓
Send Confirmation Email
After successful payment verification, the user's subscription plan is updated in MongoDB.

The frontend also refreshes the local user information so the updated plan remains available after refreshing the application.

💳 Razorpay Test Payment
YourTube uses Razorpay Test Mode, so no real money is required.

Test Card 1
Field	Value
Type	Domestic
Network	Visa
Card Type	Credit Card
Card Number	4718 6091 0820 4366
CVV	Any random CVV
Expiry	Any future date
Test Card 2
Field	Value
Type	International
Network	Mastercard
Card Type	Credit Card
Card Number	5104 0155 5555 5558
CVV	Any random CVV
Expiry	Any future date
Test Card 3
Field	Value
Type	International
Network	Mastercard
Card Type	Debit Card
Card Number	5104 0600 0000 0008
CVV	Any random CVV
Expiry	Any future date
Razorpay Test OTP Flow
During the test payment flow, Razorpay may ask for:

Phone number

Email address

OTP

The OTP can be requested again during the same test payment flow.

If Razorpay asks for the OTP again, use the already generated OTP for that test payment.

Select Subscription
       ↓
Razorpay Checkout
       ↓
Enter Phone Number
       ↓
Enter Email Address
       ↓
Enter Test OTP
       ↓
If OTP is requested again
       ↓
Use the same generated OTP
       ↓
Payment Successful
       ↓
YourTube verifies payment
       ↓
Subscription Updated
7. 📧 Email System
MailerSend is used for transactional emails.

The application currently sends:

Login verification OTP

Subscription confirmation email

OTP email
New Device / City / State Detected
              ↓
          Generate OTP
              ↓
          MailerSend
              ↓
          User Email
Subscription email
Successful Razorpay Payment
              ↓
       Backend Verification
              ↓
        Plan Updated
              ↓
          MailerSend
              ↓
   Subscription Confirmation
The sender uses the MailerSend test domain configured for the project.

8. 🎥 Custom Video Player
YourTube includes a custom video player with:

Play / Pause

Volume control

Fullscreen

Current playback time

Total duration

Forward 10 seconds

Backward 10 seconds

Loading state

Next-video functionality

Mobile double-tap seeking

The player is designed to work across desktop and mobile screens.

9. 👥 Watch Party
Watch Party allows users to watch videos together in a synchronized environment.

Users can:

Create a Watch Party

Join a Watch Party

Synchronize video playback

Synchronize play/pause

Synchronize seeking

Chat in real time

Use audio/video communication

Share their screen

Watch Party architecture
              ┌─────────────────┐
              │      User A     │
              │     Browser     │
              └────────┬────────┘
                       │
                  Socket.IO
                       │
                       ▼
              ┌─────────────────┐
              │    Backend      │
              │  Party Manager  │
              └────────┬────────┘
                       │
                  Socket.IO
                       │
                       ▼
              ┌─────────────────┐
              │      User B     │
              │     Browser     │
              └─────────────────┘

                 WebRTC
          Audio / Video / Screen
                  ↕
          User A ↔ User B
Synchronized actions
Watch Party can synchronize actions such as:

Play
Pause
Seek
These events are communicated to other participants so that their video playback can remain synchronized.

10. 📹 WebRTC
WebRTC is used for real-time communication between Watch Party participants.

Supported functionality includes:

Camera

Microphone

Audio communication

Video communication

Screen sharing

11. 🎙️ Host-Only Recording
The Watch Party includes an optional recording capability.

Recording is performed locally by the host.

The recording does not automatically create a server-side recording containing remote participants, remote video, or chat history.

☁️ Cloudinary
Cloudinary is used for cloud-based media storage.

It allows the application to manage media without storing large media files directly inside the application server.

🗄️ Database
YourTube uses MongoDB with Mongoose.

The database is used for application information including:

User information

Subscription plan

Login/device information

OTP information

Comments

Video-related data

Download-related information

Other application data

Mongoose is used as the object modeling layer between Node.js and MongoDB.

🏗️ System Architecture
                         ┌───────────────────────┐
                         │        User           │
                         │   Desktop / Mobile    │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    Next.js Frontend   │
                         │  React + TypeScript   │
                         │     Tailwind CSS      │
                         └───────────┬───────────┘
                                     │
                                HTTP / API
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │   Node.js + Express   │
                         │        Backend        │
                         └───────────┬───────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
       │   MongoDB    │       │  Cloudinary  │       │   Firebase   │
       │   Database   │       │ Media Storage│       │     Auth     │
       └──────────────┘       └──────────────┘       └──────────────┘
              │
              │
       ┌──────┴───────────┐
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│   Razorpay   │   │  MailerSend  │
│ Test Payment │   │    Emails    │
└──────────────┘   └──────────────┘

                  Watch Party
                       │
                ┌──────┴──────┐
                ▼             ▼
           Socket.IO        WebRTC
           Real-time       Audio/Video
           Events          Screen Share
🧰 Technology Stack
Frontend
Technology	Purpose
Next.js	Frontend framework
React	UI development
TypeScript	Type-safe development
Tailwind CSS	Styling and responsive UI
Axios	API communication
Firebase	Google authentication
Backend
Technology	Purpose
Node.js	Backend runtime
Express.js	REST API framework
MongoDB	Database
Mongoose	MongoDB object modeling
Socket.IO	Real-time communication
WebRTC	Real-time audio/video communication
External Services
Service	Purpose
Firebase Authentication	Google login
Cloudinary	Media storage
Razorpay	Test subscription payments
MailerSend	OTP and subscription emails
Vercel	Frontend deployment
Render	Backend deployment
🔌 Backend Functionality
Major backend functionality includes:

/user
/otp
/predict-price
/weather
/equipment
/rent-equipment
/detect-disease
/predictions
/dashboard-stats
/download
/subscription
/watch-party
The available routes are implemented according to the current application functionality.

🔐 Security
YourTube uses multiple security mechanisms.

Authentication
Google authentication is handled through Firebase.

OTP Verification
New login situations can trigger additional OTP verification.

Environment Variables
Sensitive credentials are stored using environment variables.

Examples:

DB_URL=...
RAZORPAY_KEY_SECRET=...
CLOUDINARY_API_SECRET=...
MAILERSEND_API_KEY=...
The .env file is excluded from GitHub using .gitignore.

Payment Verification
Razorpay payment details are verified by the backend before updating the user's subscription.

Backend Download Limits
Subscription and download restrictions are checked on the backend.

📁 Project Structure
you_tube2.0/
│
├── yourtube/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   └── ...
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── Modals/
│   ├── utils/
│   ├── middleware/
│   ├── index.js
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
⚙️ Local Installation
1. Clone the repository
git clone https://github.com/bhaveshramu/you_tube2.0.git
cd you_tube2.0
2. Install frontend dependencies
cd yourtube
npm install
3. Install backend dependencies
Open another terminal:

cd server
npm install
🔑 Environment Variables
Create the backend environment file:

server/.env
Configure the required values:

DB_URL=your_mongodb_connection_string

PORT=5000

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

MAILERSEND_API_KEY=your_mailersend_api_key
Never commit the .env file to GitHub.

▶️ Running Locally
Backend
From the server directory:

npm start
The backend runs on the configured port.

Example:

http://localhost:5000
Frontend
From the yourtube directory:

npm run dev
The frontend can then be opened using the local Next.js development URL.

🚀 Deployment
Frontend
The Next.js frontend is deployed on Vercel.

Production URL:

https://yourtube-peach-zeta.vercel.app

Backend
The Node.js/Express backend is deployed on Render.

Production URL:

https://yourtube-backend-ezta.onrender.com

Database
MongoDB is used for persistent application data.

Media Storage
Cloudinary is used for media storage.

📱 Responsive Design
YourTube is designed to work across:

Desktop

Laptop

Tablet

Mobile devices

The interface uses responsive React components and Tailwind CSS to adapt to different screen sizes.

The deployed application has also been tested on mobile for the authentication and OTP flow.

🧪 Testing
Authentication
Google authentication can be tested through the live application.

New Device OTP
Signing in from a new device can trigger the additional OTP verification flow.

Razorpay
Use the provided Razorpay test cards. No real payment is required.

Email
MailerSend handles:

Login OTP emails

Subscription confirmation emails

Downloads
Download limits depend on the selected subscription plan.

Watch Party
Create and join a Watch Party to test synchronized playback, chat, and WebRTC functionality.

🔄 Complete User Flow
                     START
                       │
                       ▼
                Open YourTube
                       │
                       ▼
                Google Sign In
                       │
                       ▼
            Firebase Authentication
                       │
                       ▼
             Backend User Verification
                       │
             ┌─────────┴─────────┐
             │                   │
       Normal Login          New Device /
             │              City / State
             │                   │
             │                   ▼
             │              OTP Email
             │                   │
             │                   ▼
             │              Verify OTP
             │                   │
             └─────────┬─────────┘
                       ▼
                     Home
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   Watch Video   Subscription     Watch Party
        │              │              │
        ▼              ▼              ▼
    Comments       Razorpay       Socket.IO
        │              │           + WebRTC
        ▼              ▼
    Download      Plan Updated
        │              │
        ▼              ▼
 Download Limits  Confirmation Email
🎯 Project Objectives
The objectives of YourTube are:

Develop a full-stack video streaming platform.

Implement secure user authentication.

Provide additional login verification using OTP.

Implement subscription-based functionality.

Integrate online payment processing.

Implement controlled video downloads.

Develop a custom video player.

Provide real-time Watch Party functionality.

Implement real-time communication using WebRTC.

Provide a responsive user interface.

Deploy the application using cloud platforms.

Integrate external services for authentication, payments, storage, and email.

🔮 Future Scope
Potential future improvements include:

Advanced recommendation system

Improved video search

Creator analytics dashboard

Advanced video processing

Additional subscription plans

Additional payment methods

Advanced content moderation

Improved Watch Party scalability

Push notifications

Mobile application

Advanced video analytics

Machine-learning-based content personalization

⚠️ Demo Notes
Razorpay
Razorpay is configured in Test Mode. Do not use real payment information.

OTP
A new device, city, or state can trigger an OTP verification step.

Backend
The backend is deployed on Render. If the service has been inactive, the first request can take additional time while the service becomes available.

Email
OTP and subscription emails are handled using MailerSend.

🔗 Project Links
Resource	Link
🌐 Live Application	https://yourtube-peach-zeta.vercel.app
⚙️ Backend	https://yourtube-backend-ezta.onrender.com
💻 GitHub Repository	https://github.com/bhaveshramu/you_tube2.0
📜 License
This project was developed as an academic/internship project for educational and demonstration purposes.nd**, **Node.js/Express backend**, **MongoDB database**, **Firebase Authentication**, **Razorpay payments**, **MailerSend email services**, **Cloudinary media storage**, **Socket.IO**, and **WebRTC** to provide a complete video-platform experience.

---

## 🌐 Live Demo

**Live Application:**
`https://yourtube-peach-zeta.vercel.app`

**Backend API:**
`https://yourtube-backend-ezta.onrender.com`

**GitHub Repository:**
`https://github.com/bhaveshramu/you_tube2.0`

---

# 📌 Project Overview

Traditional video-sharing platforms provide video streaming, commenting, subscriptions, and other features separately.

YourTube brings several of these capabilities together into one full-stack application while adding features such as:

* Secure Google authentication
* New-device/city/state OTP verification
* Personalized automatic theme
* Subscription plans
* Razorpay payment integration
* Subscription-based download limits
* Controlled video downloads
* Custom video player
* Real-time Watch Party
* Synchronized video playback
* Real-time chat
* WebRTC audio/video communication
* Screen sharing
* Host-only recording
* Cloudinary video/image storage
* Email notifications
* Responsive interface

The project was developed with both **functionality and real-world deployment** in mind.

---

# ✨ Key Features

## 1. 🔐 Google Authentication

Users can sign in using their Google account through Firebase Authentication.

### Authentication flow

```text
User
  ↓
Google Sign In
  ↓
Firebase Authentication
  ↓
YourTube Backend
  ↓
User verification
  ↓
Login successful
```

The application uses Firebase for Google authentication while maintaining user information in MongoDB.

---

# 2. 🛡️ Additional Login Security with OTP

YourTube includes an additional security layer for suspicious or new login situations.

The backend checks:

* City
* State
* Device ID

If the login is detected from a new device, city, or state, an OTP verification step is triggered.

### Example

```text
Existing Login Information
        ↓
Compare new login information
        ↓
New Device / City / State?
        ↓
      Yes
        ↓
Generate OTP
        ↓
Send OTP through MailerSend
        ↓
User enters OTP
        ↓
Login completed
```

The OTP is valid for **5 minutes**.

After successful verification, the user's login information is updated.

---

# 3. 🎨 Personalized Theme

YourTube supports personalized light and dark themes.

The application includes:

* Automatic theme selection
* Manual theme selection
* Saved theme preference

The automatic theme uses the application's configured time-based behavior.

Users can also manually select their preferred theme.

---

# 4. 💬 Enhanced Comment System

Users can interact with videos through the comment system.

The system supports:

* Adding comments
* Viewing comments
* User-based comment information
* Persistent comment storage

Comments are stored through the backend and database rather than only being maintained in the browser.

---

# 5. ⬇️ Controlled Video Downloads

YourTube provides subscription-based download limits.

### Download limits

| Plan   | Daily Downloads |
| ------ | --------------: |
| Free   |               1 |
| Bronze |               5 |
| Silver |              15 |
| Gold   |       Unlimited |

The backend checks the user's current subscription plan before allowing a download.

### Download flow

```text
User requests download
        ↓
Backend checks user plan
        ↓
Check daily download count
        ↓
Limit available?
   ↓             ↓
 Yes            No
  ↓              ↓
Download      Reject request
```

This prevents users from bypassing subscription restrictions through frontend manipulation.

---

# 6. 💳 Subscription System

YourTube provides three paid subscription plans:

* Bronze
* Silver
* Gold

Payments are handled using **Razorpay Test Mode**.

The subscription process is:

```text
Select Plan
    ↓
Create Razorpay Order
    ↓
Razorpay Checkout
    ↓
Complete Test Payment
    ↓
Payment Verification
    ↓
Update MongoDB User Plan
    ↓
Send Subscription Confirmation Email
```

After successful verification, the user's plan is updated in MongoDB.

The frontend also refreshes the local user information so that the new subscription remains visible after refreshing the page.

---

# 💳 Razorpay Test Payment

The project uses Razorpay **Test Mode**, so no real money is charged.

### Test Card 1

| Field       | Value                 |
| ----------- | --------------------- |
| Type        | Domestic              |
| Network     | Visa                  |
| Card Type   | Credit Card           |
| Card Number | `4718 6091 0820 4366` |
| CVV         | Any random CVV        |
| Expiry      | Any future date       |

### Test Card 2

| Field       | Value                 |
| ----------- | --------------------- |
| Type        | International         |
| Network     | Mastercard            |
| Card Type   | Credit Card           |
| Card Number | `5104 0155 5555 5558` |
| CVV         | Any random CVV        |
| Expiry      | Any future date       |

### Test Card 3

| Field       | Value                 |
| ----------- | --------------------- |
| Type        | International         |
| Network     | Mastercard            |
| Card Type   | Debit Card            |
| Card Number | `5104 0600 0000 0008` |
| CVV         | Any random CVV        |
| Expiry      | Any future date       |

---

## 🔑 Razorpay Test OTP Flow

During the Razorpay test payment process, the checkout may ask for:

1. Phone number
2. Email address
3. OTP

The OTP may be requested more than once during the test flow.

**Important:** The same generated test OTP can be used when Razorpay asks for the OTP again during the same test payment flow.

### Example

```text
Enter phone number
        ↓
Enter email address
        ↓
OTP generated
        ↓
Enter OTP
        ↓
If OTP is requested again
        ↓
Use the already generated OTP
        ↓
Payment completed
```

After the payment is successfully verified, YourTube updates the user's subscription plan.

---

# 📧 Subscription Confirmation Email

After successful payment verification, YourTube sends a subscription confirmation email through **MailerSend**.

The email contains information such as:

* User name
* Selected plan
* Payment ID
* Razorpay order ID
* Subscription confirmation

### Email flow

```text
Successful Razorpay Payment
          ↓
Backend verifies payment
          ↓
MongoDB subscription updated
          ↓
MailerSend
          ↓
Subscription confirmation email
```

---

# 🎥 Custom Video Player

YourTube includes a custom-built video player instead of relying entirely on the browser's default video controls.

The player supports:

* Play/Pause
* Volume control
* Fullscreen
* Current playback time
* Total duration
* Forward 10 seconds
* Backward 10 seconds
* Loading state
* Next-video functionality
* Mobile double-tap seeking

The player is designed to work across desktop and mobile screens.

---

# 👥 Watch Party

Watch Party allows multiple users to watch videos together in a synchronized environment.

Users can:

* Create a Watch Party
* Join a Watch Party
* Synchronize video playback
* Pause/play together
* Synchronize seeking
* Chat in real time
* Use audio/video communication
* Share their screen

---

## 🔄 Watch Party Architecture

```text
                 ┌─────────────────┐
                 │     User A      │
                 │     Browser     │
                 └────────┬────────┘
                          │
                     Socket.IO
                          │
                          ▼
                 ┌─────────────────┐
                 │    Backend      │
                 │  Party Manager  │
                 └────────┬────────┘
                          │
                     Socket.IO
                          │
                          ▼
                 ┌─────────────────┐
                 │     User B      │
                 │     Browser     │
                 └─────────────────┘

              WebRTC
       Audio / Video / Screen
              ↕
       User A ↔ User B
```

### Synchronized actions

When a user performs an action such as:

```text
Play
Pause
Seek
```

the event is communicated to other party members so their players can remain synchronized.

---

# 📹 WebRTC Features

WebRTC is used for real-time communication between Watch Party participants.

Supported functionality includes:

* Camera
* Microphone
* Video communication
* Audio communication
* Screen sharing

The project uses peer-to-peer WebRTC communication for real-time media.

---

# 🎙️ Host-Only Recording

The Watch Party also includes an optional recording capability.

The recording is performed **locally by the host**.

It does not automatically create a server-side recording containing:

* Remote participants
* Other users' private video
* Chat history

This keeps the recording functionality focused on the host's local media/session.

---

# ☁️ Cloudinary Integration

Cloudinary is used for cloud-based media storage.

It helps the application manage uploaded media without storing large media files directly inside the application server.

The backend communicates with Cloudinary for media-related operations.

---

# 🗄️ Database

YourTube uses **MongoDB** with **Mongoose**.

The database stores application information such as:

* User information
* Subscription plan
* Login/device information
* OTP information
* Comments
* Video-related data
* Download-related information
* Watch Party-related information where applicable

Mongoose is used as the object modeling layer between Node.js and MongoDB.

---

# 🏗️ System Architecture

```text
                         ┌───────────────────────┐
                         │       User            │
                         │  Desktop / Mobile     │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │     Next.js Frontend  │
                         │   React + TypeScript   │
                         │     Tailwind CSS       │
                         └───────────┬───────────┘
                                     │
                              HTTP / API
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │ Node.js + Express     │
                         │       Backend         │
                         └───────────┬───────────┘
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
                ▼                    ▼                    ▼
        ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
        │   MongoDB    │     │  Cloudinary  │     │   Firebase   │
        │   Database   │     │ Media Storage│     │     Auth     │
        └──────────────┘     └──────────────┘     └──────────────┘
                │
                │
       ┌────────┴─────────┐
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│   Razorpay   │   │  MailerSend  │
│  Test Payment│   │    Emails    │
└──────────────┘   └──────────────┘

                 Watch Party
                     │
              ┌──────┴──────┐
              ▼             ▼
        Socket.IO         WebRTC
        Real-time         Audio/Video
        events            Screen Share
```

---

# 🧰 Technology Stack

## Frontend

| Technology   | Purpose                   |
| ------------ | ------------------------- |
| Next.js      | Frontend framework        |
| React        | UI development            |
| TypeScript   | Type-safe development     |
| Tailwind CSS | Styling and responsive UI |
| Axios        | API communication         |
| Firebase     | Google authentication     |

## Backend

| Technology | Purpose                             |
| ---------- | ----------------------------------- |
| Node.js    | Backend runtime                     |
| Express.js | REST API framework                  |
| MongoDB    | Database                            |
| Mongoose   | MongoDB object modeling             |
| Socket.IO  | Real-time communication             |
| WebRTC     | Real-time audio/video communication |

## External Services

| Service                 | Purpose                     |
| ----------------------- | --------------------------- |
| Firebase Authentication | Google login                |
| Cloudinary              | Media storage               |
| Razorpay                | Subscription payment        |
| MailerSend              | OTP and subscription emails |
| Vercel                  | Frontend deployment         |
| Render                  | Backend deployment          |
| MongoDB                 | Cloud database              |

---

# 🔌 Major Backend Components

The backend provides APIs for different parts of the application.

Major functionality includes:

```text
/user
/otp
/predict-price
/weather
/equipment
/rent-equipment
/detect-disease
/predictions
/dashboard-stats
/download
/subscription
/watch-party
```

The exact available routes may vary according to the current implementation.

---

# 🔐 Security Considerations

YourTube uses several security mechanisms:

### Authentication

Google authentication is handled through Firebase.

### OTP verification

New devices/cities/states can trigger OTP verification.

### Environment variables

Sensitive credentials are stored in environment variables rather than committed to GitHub.

Examples include:

```env
DB_URL=...
RAZORPAY_KEY_SECRET=...
CLOUDINARY_API_SECRET=...
MAILERSEND_API_KEY=...
```

The `.env` file is excluded through `.gitignore`.

### Payment verification

Razorpay payments are verified on the backend before updating the user's subscription.

### Subscription limits

Download restrictions are checked on the backend rather than relying only on frontend controls.

---

# 📁 Project Structure

```text
you_tube2.0/
│
├── yourtube/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   │
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   └── ...
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── Modals/
│   ├── utils/
│   ├── middleware/
│   ├── index.js
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

# ⚙️ Local Installation

## 1. Clone the repository

```bash
git clone https://github.com/bhaveshramu/you_tube2.0.git
```

```bash
cd you_tube2.0
```

---

## 2. Install frontend dependencies

```bash
cd yourtube
npm install
```

---

## 3. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

---

# 🔑 Environment Variables

Create:

```text
server/.env
```

and configure the required backend environment variables.

Example structure:

```env
DB_URL=your_mongodb_connection_string

PORT=5000

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

MAILERSEND_API_KEY=your_mailersend_api_key
```

Never commit the `.env` file to GitHub.

---

# ▶️ Running the Application Locally

## Start Backend

From:

```text
server/
```

run:

```bash
npm start
```

The backend runs on the configured port.

Example:

```text
http://localhost:5000
```

## Start Frontend

From:

```text
yourtube/
```

run:

```bash
npm run dev
```

The frontend can then be accessed through the local Next.js development server.

---

# 🚀 Deployment

## Frontend

The Next.js frontend is deployed using **Vercel**.

Production URL:

`https://yourtube-peach-zeta.vercel.app`

## Backend

The Node.js/Express backend is deployed using **Render**.

Production backend:

`https://yourtube-backend-ezta.onrender.com`

## Database

MongoDB is used as the persistent database.

## Media

Cloudinary is used for cloud media storage.

---

# 📧 Email Architecture

YourTube uses MailerSend for transactional emails.

### OTP Email

```text
Login
  ↓
New Device Detected
  ↓
Generate OTP
  ↓
MailerSend
  ↓
User Email
```

### Subscription Email

```text
Razorpay Payment
      ↓
Backend Verification
      ↓
Plan Updated
      ↓
MailerSend
      ↓
Confirmation Email
```

---

# 🧪 Testing

The project uses test services for payment and development.

### Razorpay

Razorpay is configured in **Test Mode**.

No real payment should be made during project demonstration.

### Authentication

Google authentication can be tested through the deployed application.

### OTP

Testing a new device can trigger the additional OTP verification flow.

### Email

MailerSend is used to send:

* Login verification OTP
* Subscription confirmation

---

# 📱 Responsive Design

The application is designed for:

* Desktop
* Laptop
* Tablet
* Mobile devices

The interface adapts to different screen sizes using responsive React components and Tailwind CSS.

---

# 🔄 Complete User Flow

```text
                     START
                       │
                       ▼
                Open YourTube
                       │
                       ▼
                Google Sign In
                       │
                       ▼
              Firebase Authentication
                       │
                       ▼
             Backend User Verification
                       │
             ┌─────────┴─────────┐
             │                   │
       Normal Login          New Device/
             │             City/State
             │                   │
             │                   ▼
             │              OTP Email
             │                   │
             │                   ▼
             │              Verify OTP
             │                   │
             └─────────┬─────────┘
                       ▼
                    Home
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
    Watch Video    Subscription      Watch Party
       │               │                │
       ▼               ▼                ▼
    Comments        Razorpay        Socket.IO
       │               │             + WebRTC
       ▼               ▼
    Download       Plan Updated
       │               │
       ▼               ▼
 Download Limits  Confirmation Email
```

---

# 📊 Subscription Architecture

```text
              User selects plan
                     │
                     ▼
             Frontend requests
                Razorpay Order
                     │
                     ▼
              Razorpay Checkout
                     │
                     ▼
                Test Payment
                     │
                     ▼
             Backend Verification
                     │
                     ▼
              Update User Plan
                     │
              ┌──────┴──────┐
              ▼             ▼
          MongoDB       MailerSend
              │             │
              ▼             ▼
        New Plan Saved   Email Sent
```

---

# 🎯 Project Objectives

The main objectives of YourTube are:

1. Develop a complete full-stack video streaming platform.
2. Implement secure user authentication.
3. Provide additional login verification using OTP.
4. Implement subscription-based features.
5. Integrate online payment processing.
6. Implement controlled video downloads.
7. Develop a custom video player.
8. Provide real-time Watch Party functionality.
9. Implement real-time communication using WebRTC.
10. Provide a responsive user interface.
11. Deploy the application using cloud platforms.
12. Integrate external services for authentication, payments, storage, and email.

---

# 🔮 Future Scope

Potential future improvements include:

* Advanced recommendation system
* Video search optimization
* Creator analytics dashboard
* Video upload and processing pipeline improvements
* More subscription plans
* Additional payment methods
* Advanced moderation tools
* Improved Watch Party scalability
* Push notifications
* Mobile application
* Advanced video analytics
* Content personalization using machine learning

---

# 👨‍💻 Development Highlights

The project demonstrates practical implementation of:

* Full-stack web development
* REST API development
* Authentication
* Database management
* Payment integration
* Email automation
* Cloud deployment
* Real-time communication
* WebRTC
* Responsive UI development
* Subscription management
* Backend security checks

---

# ⚠️ Demo Notes

### Razorpay

Use **Test Mode** cards only. No real money is required.

### OTP

A new device, city, or state may trigger an OTP verification step.

### Backend

The backend is hosted on Render. If the free service has been inactive, the first request may take additional time while the service starts.

### Email

OTP and subscription emails are handled through MailerSend.

---

# 🔗 Project Links

| Resource            | Link                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| 🌐 Live Application | [https://yourtube-peach-zeta.vercel.app](https://yourtube-peach-zeta.vercel.app)         |
| ⚙️ Backend          | [https://yourtube-backend-ezta.onrender.com](https://yourtube-backend-ezta.onrender.com) |
| 💻 GitHub           | [https://github.com/bhaveshramu/you_tube2.0](https://github.com/bhaveshramu/you_tube2.0) |

---

# 📜 License

This project was developed as an academic/internship project for educational and demonstration purposes.

---

## One thing I would change before putting this into GitHub

I intentionally **did not include actual API keys, database credentials, Firebase secrets, Cloudinary secrets, or other private credentials** in the README.

I also wouldn't put your MailerSend API token anywhere in the README.

The Razorpay **test card numbers are okay to document** because they're specifically provided for test-mode payments and are not your private credentials.

### Current project status

At this point, your project has reached a pretty clean submission state:

```text
Frontend                         ✅ Deployed
Backend                          ✅ Deployed
MongoDB                           ✅ Connected
Google Authentication            ✅ Working
New-device OTP                   ✅ Working
MailerSend OTP                   ✅ Working
Subscription Payment             ✅ Working
Subscription Email               ✅ Working
Plan Persistence                 ✅ Working
Controlled Downloads             ✅ Working
Custom Video Player              ✅ Working
Watch Party                       ✅ Working
WebRTC                            ✅ Working
GitHub                            ✅ Updated
Render                            ✅ Updated
Vercel                            ✅ Updated
```
