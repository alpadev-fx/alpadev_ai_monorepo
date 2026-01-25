db = db.getSiblingDB('alpadev_ai_db');

db.createUser({
  user: 'root',
  pwd: 'root',
  roles: [
    {
      role: 'readWrite',
      db: 'alpadev_ai_db',
    },
  ],
});

db.createCollection('users');
