from flask import Flask, g, Response, json, request, send_file
from flask_cors import CORS, cross_origin
import os
import sqlite3
import uuid
from calendar import monthrange

app = Flask(__name__)
app.config.from_object(__name__)
app.config.update(dict(
	DATABASE=os.path.join(app.root_path, 'rota.db'),
	))
app.config.from_envvar('ROTA_SETTINGS', silent=True)
CORS(app)

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=5000)

def connect_db():
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = sqlite3.Row
    return rv

def init_db():
    db = get_db()
    with app.open_resource('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()

@app.cli.command('initdb')
def initdb_command():
    init_db()
    print('Initialized the database.')

def get_db():
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db

@app.teardown_appcontext
def close_db(error):
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()

@app.route('/')
def index():
    return send_file('static/index.html')

@app.route('/rota/<uuid>')
def get_rota(uuid):
    db = get_db()
    rota = db.execute('select * from rotas where uuid = ?', [uuid]).fetchone()

    if rota is None:
        return Response("Rota Not Found", status=404)
    rota = dict(rota)

    js = json.dumps(rota)
    return Response(js, status=200, mimetype='application/json')

@app.route('/rota', methods = ['POST'])
def create_rota():
    db = get_db()
    id = str(uuid.uuid4())
    name = request.json["name"]
    db.execute('insert into rotas (uuid, name) values(?,?)', [id, name])
    db.commit()
    return get_rota(id)

@app.route('/rota/<uuid>', methods = ['PUT'])
def update_rota(uuid):
    db = get_db()
    name = request.json["name"]
    db.execute('update rotas set name = ? where uuid = ?', [name, uuid])
    db.commit()
    return get_rota(uuid)

def day_to_str(year, month, day):
    return "%04d-%02d-%02d" % (int(year), int(month), int(day))

def query_to_dict(query):
    colnames = [d[0] for d in query.description]
    return [dict(zip(colnames, r)) for r in query.fetchall()]

@app.route('/rota/<uuid>/entries/<year>/<month>')
def get_rota_entries(uuid, year, month):
    dayrange = monthrange(int(year), int(month))
    startdate = day_to_str(year, month, 1)
    enddate = day_to_str(year, month, dayrange[1])
    query = get_db().execute('''select * from entries
        join rotas on entries.rota_id = rotas.id
        where rotas.uuid = ?
        and date(entries.date) >= date(?)
        and date(entries.date) <= date(?)''',
        [uuid, startdate, enddate])
    db_entries = query_to_dict(query)
    keys = [item['date'] for item in db_entries]
    db_entries = dict(zip(keys, db_entries))

    entries = []
    for day in range(1, dayrange[1]+1):
        datestr = day_to_str(year, month, day)

        if datestr in db_entries:
            entry = db_entries[datestr]
            entries.append(entry)
        else:
            entries.append(dict(date=datestr, entry=''))

    js = json.dumps(entries)
    return Response(js, status=200)

@app.route('/rota/<uuid>/entries/<year>/<month>/<day>')
def get_rota_entry(uuid, year, month, day):
    date = day_to_str(year, month, day)
    query = get_db().execute('''select * from entries
        join rotas on entries.rota_id = rotas.id
        where rotas.uuid = ?
        and date(entries.date) = date(?)''',
        [uuid, date])
    entries = query_to_dict(query)
    js = json.dumps(entries[0])
    return Response(js, status=200)

@app.route('/rota/<uuid>/entries/<year>/<month>/<day>', methods = ['PUT'])
def update_rota_entry(uuid, year, month, day):
    db = get_db()
    date = "%04d-%02d-%02d" % (int(year), int(month), int(day))
    rota = db.execute('select * from rotas where uuid = ?', [uuid]).fetchone()
    if rota is None:
        return Response("Rota Not Found", status=404)

    entry = db.execute('''select * from entries
                  join rotas on entries.rota_id = rotas.id
                  where rotas.uuid = ? and entries.date = ?''',
                  [uuid, date]).fetchone();

    value = request.data
    if entry is None:
        db.execute('insert into entries (rota_id, date, entry) values (?, ?, ?)',
                [rota["id"], date, value])
    else:
        db.execute('update entries set entry = ? where rota_id = ? and date = ?',
                [value, rota["id"], date])

    db.commit()
    entry = db.execute('select * from entries where rota_id = ? and date = ?', [rota["id"], date]).fetchone()
    entry = dict(entry)
    entry = json.dumps(entry)
    return Response(entry, status=200)

