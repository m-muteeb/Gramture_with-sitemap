const fs = require('fs');
const path = require('path');

// Import Firebase (you'll need to adjust these imports based on your Firebase setup)
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Your Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyCAIJkkLMF2no6waTa2ZAPmnLMOzzhFEc4",
  authDomain: "my-portfolio-64.firebaseapp.com",
  projectId: "my-portfolio-64",
  storageBucket: "my-portfolio-64.appspot.com",
  messagingSenderId: "951706751147",
  appId: "1:951706751147:web:7bb0ebbcee37302c5227ee",
  measurementId: "G-XPX6MR3QE7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Define your base URL for localhost
const BASE_URL = 'https://gramture.com';

// Define your static routes from App.js
const staticRoutes = [
  '/',
  '/privacy-policy',
  '/construction',
  '/about',
  '/discussion_forum',
  '/disclaimer',
  '/login'
];

// Function to fetch dynamic routes from Firebase
async function fetchDynamicRoutes() {
  const dynamicRoutes = [];
  
  try {
    // Get your topics or content collection
    // Change 'topics' to whatever your collection name is
    const topicsSnapshot = await getDocs(collection(db, 'topics'));
    
    topicsSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Adjust these fields based on your data structure
      if (data.subCategory) {
        dynamicRoutes.push(`/description/${data.subCategory}/${doc.id}`);
      }
    });
    
    console.log(`Fetched ${dynamicRoutes.length} dynamic routes from Firebase`);
  } catch (error) {
    console.error('Error fetching dynamic routes from Firebase:', error);
    console.log('Continuing with only static routes...');
  }
  
  return dynamicRoutes;
}

// Generate sitemap XML
async function generateSitemap() {
  try {
    console.log('Fetching dynamic routes...');
    const dynamicRoutes = await fetchDynamicRoutes();
    const allRoutes = [...staticRoutes, ...dynamicRoutes];
    
    // Generate current date
    const date = new Date().toISOString().split('T')[0];
    
    // Start XML sitemap content
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    
    // Add each route to the sitemap
    allRoutes.forEach(route => {
      sitemap += `  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>
`;
    });
    
    // Close sitemap
    sitemap += `</urlset>`;
    
    // Make sure public directory exists
    const publicDir = path.resolve('./public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Write sitemap to file
    const sitemapPath = path.resolve('./public/sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);
    
    // Create text version for easy reading
    let textSitemap = 'Sitemap URLs:\n\n';
    allRoutes.forEach(route => {
      textSitemap += `${BASE_URL}${route}\n`;
    });
    
    fs.writeFileSync(path.resolve('./public/sitemap.txt'), textSitemap);
    
    console.log(`Sitemap generated with ${allRoutes.length} URLs (${staticRoutes.length} static + ${dynamicRoutes.length} dynamic)`);
    console.log('Sitemap saved to public/sitemap.xml');
    console.log('Text version saved to public/sitemap.txt');
    console.log('You can view your sitemap at https://gramture.com/sitemap.xml when your app is running');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

// Run the sitemap generator
generateSitemap();