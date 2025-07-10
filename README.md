# InfluenceMatch

**InfluenceMatch** is a web-based platform designed to connect social media influencers with brands for effective collaborations. The platform supports role-based dashboards, campaign management, influencer discovery, and performance tracking features.

## Features

- Role-based login (Admin, Brand, Influencer)
- Dashboard for each role
- Create and manage campaigns (Brand)
- View and apply to campaigns (Influencer)
- View influencer applications (Brand)
- Charts for campaign performance and demographics
- Responsive UI with filter and search functionalities
- LocalStorage-based form handling and user data

## Technologies Used

- HTML, CSS, JavaScript (Vanilla)
- Chart.js for visual analytics
- Font Awesome for icons
- LocalStorage and optional Express API for backend mock

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/influencematch.git
Open the index.html file in a browser or use a local server like Live Server.

(Optional) If using the Express backend:

Navigate to the backend folder

Run npm install

Run npm start

Folder Structure
markdown
Copy
Edit
influencematch/
├── index.html
├── brand-dashboard.html
├── influencer-dashboard.html
├── admin-dashboard.html
├── js/
│   ├── components.js
│   ├── brand-dashboard.js
│   └── ...
├── css/
│   └── styles.css
└── backend/
    ├── server.js
    └── routes/
