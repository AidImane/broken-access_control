const fs = require('fs');
const path = require('path');

const usersfile = path.join(__dirname,'..','ressources','users.json');

const userModel = {
    add: ({username,email,password}) => {
        const data = JSON.parse(fs.readFileSync(usersfile,'utf-8'));
        const newUser = {
            id:data.nextId++,
            username,
            email,
            password,
            role:"1"
        }
        data.users.push(newUser);
        fs.writeFileSync(usersfile,JSON.stringify(data,null,2));
        return newUser;
    },
    findByUsername: (username) => {
        const data = JSON.parse(fs.readFileSync(usersfile,'utf-8'));
        return data.users.find(user=>user.username === username);
    },
    findAll: () => {
        const data = JSON.parse(fs.readFileSync(usersfile,'utf-8'));
        return data.users;
    },
    findByEmail: (email) => {
        const data = JSON.parse(fs.readFileSync(usersfile,'utf-8'));
        return data.users.find(user=>user.email === email);
    },
    findById: (id) => {
        const data = JSON.parse(fs.readFileSync(usersfile,'utf-8'));
        return data.users.find(user=>user.id === id);
    },
    update: (id, updates) => {
        const data = JSON.parse(fs.readFileSync(usersfile,'utf-8'));
        const userIndex = data.users.findIndex(user => user.id === id);
        
        if (userIndex === -1) {
            return null; 
        }
        const currentUser = data.users[userIndex];

        const updatedUser = { ...currentUser };

        if (updates.email) {
            updatedUser.email = updates.email;
        }
        
        if (updates.role) {
            updatedUser.role = updates.role;
        }

        data.users[userIndex] = updatedUser;

        fs.writeFileSync(usersfile, JSON.stringify(data, null, 2));
        
        return updatedUser;
    },
    delete: (id) => {
        const data = JSON.parse(fs.readFileSync(usersfile,'utf-8'));
        const userIndex = data.users.findIndex(user => user.id === id);

        data.users.splice(userIndex, 1);

        fs.writeFileSync(usersfile, JSON.stringify(data, null, 2));
        
        return true;
    }
};

module.exports = userModel;
