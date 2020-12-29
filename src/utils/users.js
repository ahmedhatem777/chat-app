const users = [];

//Adding a user
const addUser = ({id, username, room}) => {
    //Cleaning the data
    username = username.trim().toLowerCase().replace(' ','');
    room = room.trim().toLowerCase().replace(' ','');

    //Ensuring that data is provided
    if(!username || !room) return {error: 'Username and room are required!'}

    //Checking for unique username in a room
    const userExists = users.find( (user) => {
        return user.room === room && user.username == username;
    })
    if(userExists) return {error: 'Username already exists!'}

    //Storing user
    const user = {id, username, room }
    users.push(user);
    return {user};
}

//Removing a user
const removeUser = (id) => {
    const userIndex = users.findIndex( (user) => user.id === id );

    if(userIndex !== -1) {
        return users.splice(userIndex, 1);
    }
}

//Getting a user
const getUser = (id) => {
    const user = users.find( (user) => user.id === id);
    if(!user) return {error: 'User not found!'}
    return user;
}

//Getting users in a room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase().replace(' ','');
    return users.filter( (user) => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// const user1 = { id: 23, username: 'ahmedhatem1', room: 'heliopolis1' };
// const user2 = { id: 24, username: 'ahmedhatem2', room: 'heliopolis1' };
// const user3 = { id: 25, username: 'ahmedhatem3', room: 'heliopolis1' };
// const user4 = { id: 26, username: 'ahmedhatem4', room: 'heliopolis' };
// addUser(user1);
// addUser(user2);
// addUser(user3);
// addUser(user4);
// console.log(users);
// const usersInRoom = getUsersInRoom('heliopolis');
// console.log(usersInRoom);