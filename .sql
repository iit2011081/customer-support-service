-- Drop table

-- DROP TABLE public."role";

CREATE TABLE public."role" (
	id varchar(255) NOT NULL,
	name varchar(255) NOT NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NOT NULL,
	deleted_at timestamptz NULL,
	CONSTRAINT role_pkey PRIMARY KEY (id)
);

-- Drop table

-- DROP TABLE public."user";

CREATE TABLE public."user" (
	id varchar(255) NOT NULL,
	full_name varchar(255) NOT NULL,
	alias varchar(255) NOT NULL,
	created_at timestamptz NOT NULL,
	updated_at timestamptz NOT NULL,
	deleted_at timestamptz NULL,
	role_id varchar(255) NOT NULL,
	CONSTRAINT user_pkey PRIMARY KEY (id),
	CONSTRAINT user_role_id_fkey FOREIGN KEY (role_id) REFERENCES role(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Drop table

-- DROP TABLE public."session";

CREATE TABLE public."session" (
	id varchar(255) NOT NULL,
	status varchar(255) NOT NULL,
	priority int2 NOT NULL DEFAULT 1,
	rating int2 NULL,
	feedback varchar(255) NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NOT NULL,
	deleted_at timestamptz NULL,
	customer_id varchar(255) NOT NULL,
	agent_id varchar(255) NULL,
	CONSTRAINT session_pkey PRIMARY KEY (id),
	CONSTRAINT session_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES "user"(id) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT session_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES "user"(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Drop table

-- DROP TABLE public.message;

CREATE TABLE public.message (
	id varchar(255) NOT NULL,
	"content" varchar(255) NOT NULL,
	attachment varchar[] NOT NULL DEFAULT ARRAY[]::character varying[]::character varying(255)[],
	created_at timestamptz NULL,
	updated_at timestamptz NOT NULL,
	deleted_at timestamptz NULL,
	sender_id varchar(255) NOT NULL,
	receiver_id varchar(255) NULL,
	session_id varchar(255) NOT NULL,
	CONSTRAINT message_pkey PRIMARY KEY (id),
	CONSTRAINT message_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES "user"(id) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT message_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES "user"(id) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT message_session_id_fkey FOREIGN KEY (session_id) REFERENCES session(id) ON UPDATE CASCADE ON DELETE CASCADE
);


INSERT INTO public."role" (id,"name",created_at,updated_at,deleted_at) VALUES 
('1hj6fin00000000','Customer','2021-08-23 11:50:37.172','2021-08-23 11:50:37.172',NULL)
,('1hj6fiv00000000','Agent','2021-08-23 11:50:43.200','2021-08-23 11:50:43.200',NULL)
;
