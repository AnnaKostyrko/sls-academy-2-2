create EXTENSION if not exists "uuid-ossp";

create TABLE users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT not null,
    password TEXT not null
)

insert into users (email, password) values ('anna@gmail.com', 'anna123')

CREATE TABLE refreshtokens (
	id int NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	refreshtoken varchar NOT NULL,
	createdat date NOT NULL
);