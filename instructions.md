# Project Setup & Running Instructions

---

## I. Prerequisites

Ensure you have the following software installed on your system:

1.  **Git:** For cloning the repository. ([https://git-scm.com/downloads](https://git-scm.com/downloads))
2.  **Python:** Version 3.8 or higher recommended. Comes with `pip`. ([https://www.python.org/downloads/](https://www.python.org/downloads/))
3.  **Node.js and npm:** LTS (Long Term Support) version recommended. npm comes bundled with Node.js. ([https://nodejs.org/](https://nodejs.org/)) (Alternatively, you can use `yarn` if you prefer: [https://yarnpkg.com/](https://yarnpkg.com/))
4.  **PostgreSQL Client:** Tools like `psql` can be helpful for interacting directly with the database if needed. Installation depends on your OS.

---

## II. Project Setup

**1. Clone the Repository:**

Open your terminal and run:

```bash
git clone git@github.com:Debjit-Banerji/Secure-Messaging-Website-P2P-Marketplace.git
cd Secure-Messaging-Website-P2P-Marketplace
```

```bash
pip install -r requirements.txt
  ```
  ```bash
  python manage.py makemigrations
  python manage.py migrate
  ```
*(You might only need `migrate` if no model changes were made).*


To gain admin preivelage use the following credentials :
  *   Username: `admin`
  *   Password: `aadh@235`

```bash
npm install
  ```
### To start the backend, navigate to backend directory and run:
``` bash
python manage.py runserver
```

### To start the frontend, navigate to frontend directory in another terminal and run:
```bash
npm start
```

### Main Application: Open your web browser and navigate to https://192.168.2.240:3000/ ( make sure you are connected to IIITD network)
