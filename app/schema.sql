drop table if exists rotas;
create table rotas (
	id integer primary key autoincrement,
	uuid text not null,
	name text not null
);

drop index if exists rotas_uuid;
create unique index rotas_uuid on rotas (uuid);

drop table if exists entries;
create table entries (
	id integer primary key autoincrement,
	rota_id integer,
	'date' integer not null,
	'entry' text not null,
	foreign key(rota_id) references rotas(id)
);
create unique index entries_rota_id_date on entries (rota_id, date);
