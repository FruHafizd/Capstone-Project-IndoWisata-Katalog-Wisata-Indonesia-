@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

* {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif;
}

body {
    background-color: #eaeaea;
}

/* Header Styles */
.header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 15px 20px;
    background: rgba(0, 0, 0, 0);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1000;
}

.brand {
    font-size: 22px;
    font-weight: 600;
    color: white;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 10px;
}

.brand:hover {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 700;
}

.navbar a {
    font-size: 20px;
    color: #fff;
    text-decoration: none;
    font-weight: 500;
    margin: 0 20px;
    transition: 0.3s;
}

.navbar a:hover, .navbar a.active {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 700;
}

.navbar span {
    font-size: 20px;
    color: #fff;
    text-decoration: none;
    font-weight: 500;
    margin: 0 20px;
    transition: 0.3s;
    cursor: pointer;
}

.hamburger {
    display: none;
    font-size: 26px;
    color: white;
    cursor: pointer;
    z-index: 1001;
}

/* Hero Section */
.hero {
    width: 100%;
    height: 650px;
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(7, 7, 7, 0.5)), url(../image/1.jpg);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    animation: bgchange 20s ease-in-out infinite;
    display: flex;
    align-items: center;
    justify-content: center;
}

@keyframes bgchange {
    0% {
        background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(7, 7, 7, 0.5)), url(../image/1.jpg);
    }
    20% {
        background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(7, 7, 7, 0.5)), url(../image/1.jpg);
    }
    25% {
        background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(7, 7, 7, 0.5)), url(../image/2.jpg);
    }
    45% {
        background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(7, 7, 7, 0.5)), url(../image/2.jpg);
    }
    50% {
        background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(7, 7, 7, 0.5)), url(../image/3.jpg);
    }
    70% {
        background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(7, 7, 7, 0.5)), url(../image/3.jpg);
    }
    75% {
        background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(7, 7, 7, 0.5)), url(../image/4.jpg);
    }
    90% {
        background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(7, 7, 7, 0.5)), url(../image/4.jpg);
    }
}

.opening {
    text-align: center;
    color: #ffffff;
    width: 80%;
    max-width: 1200px;
}

.opening h1 {
    font-size: 60px;
    font-weight: 600;
    margin-bottom: 20px;
}

.opening p {
    font-size: 20px;
    margin-bottom: 20px;
}

/* Rest of your existing styles */
.container {
    margin: 70px auto;
    max-width: 1100px;
    padding: 12px 18px;
}

.dst .title2 h1 {
    width: 70%;
    padding-bottom: 50px;
    font-size: 40px;
    font-weight: 600;
    color: #222;
}

.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 25px;
    padding-bottom: 100px;
}

.grid-item {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    background-color: #fff;
    text-align: left;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
}

.grid-item h3 {
    padding-left: 10px;
    width: 90%;
}

.grid-item p {
    padding-left: 10px;
}

.grid-item:hover {
    transform: scale(1.05);
}

.grid-item img {
    width: 100%;
    height: 400px;
    object-fit: cover;
    padding-bottom: 20px;
}

.rating b {
    color: black;
    font-size: 15px;
    font-weight: 10;
}

.checked {
    color: orange;
}

.rating {
    margin-top: 10px;
    font-size: 1.2em;
    color: rgb(0, 0, 0);
    padding-bottom: 20px;
    padding-left: 10px;
}

.footer {
    color: rgb(0, 0, 0);
    padding-left: 110px;
    padding-right: 110px;
}

.footer-content {
    display: flex;
    justify-content: space-between;
}

.footer-links,
.category {
    list-style: none;
    padding: 0;
}

.footer-links li, .category p {
    margin: 5px 0;
}

.social-media {
    display: flex;
    justify-content: space-between;
    width: 100px;
}

.social-media a {
    color: #222;
}

/* Responsive Design */
@media (max-width: 768px) {
    .header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 60px; /* fixed height */
        padding: 0 20px;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 1000;
        overflow: visible; /* <=== key */
    }
    
    .hamburger {
        display: block;
        font-size: 24px;
        color: #fff;
        margin-left: 150px;
    }
    
    .navbar {
        position: fixed;
        top: 90px; 
        width: 190px;
        background: rgba(0, 0, 0, 0.9);
        border-radius: 8px;
        opacity: 0;
        max-height: 0;
        overflow: visible;
        transition: opacity 0.3s ease, max-height 0.3s ease;
        z-index: 1001;
        display: flex;
        margin-left: -250px;
        flex-direction: column; 
    }

    .navbar.active {
        opacity: 1;
        max-height: 300px;
        padding: 10px 0;
        color: white;
    }

    .navbar a {
        display: block;
        padding: 12px;
        font-size: 16px;
        color: white;
        text-align: left;
        width: 100%;
        transition: 0.3s;
    }
    .navbar a.active {
        color: white;
    }
    .navbar a:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    .navbar span {
        display: block;
        padding: 12px;
        font-size: 16px;
        color: rgb(1, 1, 1);
        text-align: left;
        width: 100%;
        transition: 0.3s;
    }
    .navbar span.active {
        color: rgb(0, 0, 0);
    }
    .navbar span:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    .navbar .dropdown-menu {
        overflow: visible; /* Prevent overflow from hiding content */
    }
    .navbar .dropdown-item {
    white-space: nowrap; /* Prevent wrapping */
    text-overflow: ellipsis; /* Add ellipsis for long text, if desired */
    color: #222;
}
    .hero {
        height: 500px;
    }
    
    .opening h1 {
        font-size: 40px;
    }
    
    .opening p {
        font-size: 16px;
    }
    
    .container {
        margin: 50px auto;
        padding: 10px 15px;
    }
    
    .dst .title2 h1 {
        width: 100%;
        font-size: 30px;
    }
    
    .grid-container {
        grid-template-columns: 1fr;
    }
    
    .footer {
        padding-left: 20px;
        padding-right: 20px;
    }
    
    .footer-content {
        flex-direction: column;
        gap: 20px;
    }
}
