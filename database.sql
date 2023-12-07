\c postgres
DROP DATABASE IF EXISTs appologram;
CREATE DATABASE appologram;
\c appologram;

CREATE TABLE utilisateurs(
    username VARCHAR(50) PRIMARY KEY NOT NULL, /*username acts as the id for the person*/
    pass VARCHAR(25) NOT NULL,
    nb_followers INT DEFAULT 0,
    nb_followed INT DEFAULT 0,
    pp Varchar(255) NOT NULL DEFAULT '/public/Dodi.jpeg',
    bio VARCHAR(300) DEFAULT ''
);

CREATE TABLE follow_tab(
    id SERIAL PRIMARY KEY,
    this_user VARCHAR(50) REFERENCES utilisateurs(username) NOT NULL,
    follows VARCHAR(50) REFERENCES utilisateurs(username) NOT NULL
);

CREATE TABLE images(
    id SERIAL PRIMARY KEY,
    file_path VARCHAR(200) NOT NULL default '',
    username_fk VARCHAR(50) REFERENCES utilisateurs(username) NOT NULL,
    nb_likes INT DEFAULT 0,
    bio VARCHAR(300) DEFAULT ''
);

CREATE TABLE likes(
    id SERIAL PRIMARY KEY,
    image_fk INT REFERENCES images(id),
    username_fk VARCHAR(50) REFERENCES utilisateurs(username)
);

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    image_fk INT REFERENCES images(id),
    username_fk VARCHAR(50) REFERENCES utilisateurs(username),
    texte VARCHAR(300) NOT NULL
);

CREATE TABLE conversations(
    id SERIAL PRIMARY KEY,
    user1 VARCHAR(50) REFERENCES utilisateurs(username),
    user2 VARCHAR(50) REFERENCES utilisateurs(username)
);

CREATE TABLE messages(
    image_fk INT REFERENCES images(id),
    sender VARCHAR(50) REFERENCES utilisateurs(username),
    receiver VARCHAR(50) REFERENCES utilisateurs(username),
    texte VARCHAR(300) NOT NULL,
    conversations_fk INT REFERENCES conversations(id)
);

INSERT INTO utilisateurs (username, pass,nb_followers,nb_followed) VALUES ('user1', '1','0','2');
INSERT INTO utilisateurs (username, pass,nb_followers,nb_followed) VALUES ('user2', '2','1','0');
INSERT INTO utilisateurs (username, pass,nb_followers,nb_followed) VALUES ('user3', '3','1','0');

INSERT INTO follow_tab (this_user, follows) VALUES ('user1', 'user2');
INSERT INTO follow_tab (this_user, follows) VALUES ('user1', 'user3');


INSERT INTO images (file_path, username_fk, nb_likes) VALUES ('/public/image1.jpg', 'user2', 1);
INSERT INTO images (file_path, username_fk) VALUES ('/public/image2.jpg', 'user2');
INSERT INTO images (file_path, username_fk) VALUES ('/public/image3.jpg', 'user3');
INSERT INTO images (file_path, username_fk) VALUES ('/public/image4.jpg', 'user3');

INSERT INTO likes (image_fk, username_fk) Values (1, 'user2');
INSERT INTO likes (image_fk, username_fk) Values (2, 'user2');

SELECT * FROM utilisateurs;
SELECT * FROM follow_tab;
SELECT * FROM images;