# 🍃 FoodRescue

### Smart Food Recovery Network

FoodRescue is a smart surplus-food recovery platform designed to help reduce food waste by connecting surplus food donors with nearby verified rescue organizations.

The platform helps donors report available surplus food and uses an intelligent matching system to identify suitable organizations based on urgency, distance, capacity, and food compatibility.

---

## 🌱 Problem

Large quantities of edible food can become surplus at restaurants, hostels, events, and other food-serving locations.

At the same time, relief organizations and community partners may have the capacity to redistribute that food.

The challenge is coordinating these two sides quickly enough, especially when food has a limited pickup window.

FoodRescue addresses this coordination problem through a structured rescue workflow and smart organization matching.

---

## 💡 Solution

FoodRescue provides a centralized workflow for:

1. Reporting surplus food
2. Identifying suitable rescue organizations
3. Comparing organizations using a Match Score
4. Accepting a rescue opportunity
5. Tracking pickup and delivery progress
6. Recording the rescued impact

### Rescue Flow

**Report Surplus → Smart Match → Organization Selection → Pickup → Rescued → Impact**

---

## 🧠 Smart Matching

The core feature of FoodRescue is its organization matching system.

Each potential organization receives a Match Score based on multiple factors:

| Factor | Weight |
|---|---:|
| Urgency | 35% |
| Distance | 25% |
| Capacity | 25% |
| Food Compatibility | 15% |

The system uses these factors to help identify organizations that are suitable for a particular surplus-food opportunity.

The interface also explains the score through a transparent matching breakdown instead of presenting the result as a black box.

---

## 🚀 Key Features

### 🍱 Surplus Food Reporting
Donors can report available surplus food with information such as:

- Food type
- Quantity
- Location
- Pickup deadline
- Urgency
- Description

### 🧠 Smart Organization Matching
Potential rescue organizations can be compared using:

- Urgency
- Distance
- Available capacity
- Food compatibility

### 🏢 Verified Partner Organizations
The platform provides an organization directory containing information such as:

- Organization type
- Location
- Capacity
- Active rescues
- Completed rescues
- Availability

### 📦 Rescue Status Tracking

Every rescue opportunity can move through a structured workflow:

**Posted → Matched → Accepted → Picked Up → Rescued**

### 📊 Impact Dashboard

FoodRescue tracks rescue impact through metrics such as:

- Servings rescued
- Food waste avoided
- Partner organizations involved
- Estimated environmental impact

### 📜 Rescue History

Completed rescues are recorded in a transparent history view so that previous rescue activity can be reviewed.

---

## 🎯 Hackathon Problem Statement

FoodRescue is built for the **Smart & Sustainable Future** problem area.

The project focuses on using technology to improve the coordination of surplus food recovery and reduce avoidable food waste.

---

## 🛠️ Tech Stack

- **React**
- **Vite**
- **JavaScript**
- **React Router**
- **CSS**
- **Git & GitHub**

---

## 🏗️ Project Structure

```text
foodrescue-radar/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── MatchModal.jsx
│   │   ├── Navbar.jsx
│   │   ├── NearbyRadarMap.jsx
│   │   ├── StatusBadge.jsx
│   │   └── UrgencyBadge.jsx
│   │
│   ├── context/
│   │
│   ├── data/
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Organizations.jsx
│   │   ├── ReportFood.jsx
│   │   ├── RescueDashboard.jsx
│   │   └── RescueHistory.jsx
│   │
│   ├── utils/
│   │   ├── impact.js
│   │   └── matching.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js