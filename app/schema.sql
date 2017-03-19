create table if not exists rotas (
	id integer primary key autoincrement,
	uuid text not null,
	name text not null
);

create unique index if not exists rotas_uuid on rotas (uuid);

create table if not exists entries (
	id integer primary key autoincrement,
	rota_id integer,
	'date' integer not null,
	'entry' text not null,
	foreign key(rota_id) references rotas(id)
);
create unique index if not exists entries_rota_id_date on entries (rota_id, date);
