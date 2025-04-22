const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const userModel = require('./middlewares/userModel');
const { isAuthenticated, isAdmin } = require('./middlewares/authOuti');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 *30}
}));
app.use(express.static(path.join(__dirname, 'assets')));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'views','index.html'))
});
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'views','login.html'))
});
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,'views','register.html'))
});
app.get('/admin-dashboard',isAuthenticated, isAdmin, (req,res)=>{
    res.sendFile(path.join(__dirname,'views','admin_dashboard.html'))
});
app.get('/users',isAuthenticated, isAdmin, (req,res)=>{
    res.sendFile(path.join(__dirname,'views','users.html'))
});
app.get('/profile',isAuthenticated, (req,res)=>{
    res.sendFile(path.join(__dirname,'views','profile.html'))
});
app.get('/update-profile',isAuthenticated, (req,res)=>{
    res.sendFile(path.join(__dirname,'views','update.html'))
});
app.get('/edit',isAuthenticated, (req,res)=>{
    res.sendFile(path.join(__dirname,'views','edit_user.html'))
});
app.get('/getUsers', (req, res) => {
    res.json({ users: userModel.findAll() });
  });
app.post('/login', (req, res) => {
    const { username , email, password } = req.body;
    const user = userModel.findByUsername(username);
  
    if (!user || user.password !== password) {
      return res.status(401).send('Invalid Credentials');
    }
    req.session.user = user;
    if (user.role === '2') {
      res.redirect('/admin-dashboard');
    } else {
      res.redirect('/profile');
    }
});
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    if (userModel.findByUsername(username) || userModel.findByEmail(email)) {
        return res.status(400).send('Username already exists.');
    }
    const newUser = userModel.add({ username, email, password });
    req.session.user = newUser;
    res.redirect('/profile');
});
app.post('/api/update-profile', isAuthenticated, (req, res) => {
    try {
        const userId = req.session.user.id;
        const { email, role } = req.body;

        const currentUser = userModel.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updates = {};
        if (email) {
            updates.email = email;
        }
        if (role) {
            updates.role = role;
        }
        const updatedUser = userModel.update(userId, updates);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        req.session.user = updatedUser;
        res.json({
            success: true,
            user: {
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/deleteUser', (req, res) => {
    const { userId } = req.body;
    userModel.delete(userId);
    
});
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});
app.get('/user-info', isAuthenticated, (req, res) => {
    const user = req.session.user;
    res.json({
        username: user.username,
        email: user.email,
        role: user.role
    });
});
app.get('/getUsers', isAuthenticated, isAdmin, (req, res) => {
    try {
        const users = userModel.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/api/users', isAuthenticated, isAdmin, (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        if (userModel.findByUsername(username) || userModel.findByEmail(email)) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        
        const newUser = userModel.add({ username, email, password, role });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.delete('/deleteUser/:id', isAuthenticated, isAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const result = userModel.delete(parseInt(id));
        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});


