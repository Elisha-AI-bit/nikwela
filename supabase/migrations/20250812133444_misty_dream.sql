CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('commuter', 'driver', 'admin')) DEFAULT 'commuter',
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_point text NOT NULL,
  end_point text NOT NULL,
  distance_km decimal(10,2) NOT NULL DEFAULT 0,
  estimated_time integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE,
  name text NOT NULL,
  latitude decimal(10,8) NOT NULL,
  longitude decimal(11,8) NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ZMW',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES users(id) ON DELETE CASCADE,
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL DEFAULT 0,
  method text NOT NULL CHECK (method IN ('mtn_money', 'airtel_money', 'zamtel_kwacha', 'cash')) DEFAULT 'cash',
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  transaction_ref text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES trips(id) ON DELETE CASCADE,
  latitude decimal(10,8) NOT NULL,
  longitude decimal(11,8) NOT NULL,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE fares ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role = 'admin'
  FROM users
  WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_driver() RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role = 'driver'
  FROM users
  WHERE id = auth.uid();
$$;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Anyone can read routes"
  ON routes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage routes"
  ON routes FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Anyone can read stops"
  ON stops FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage stops"
  ON stops FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Anyone can read fares"
  ON fares FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage fares"
  ON fares FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can read all trips"
  ON trips FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Drivers can manage own trips"
  ON trips FOR ALL
  TO authenticated
  USING (
    driver_id = auth.uid() OR is_admin()
  );

CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR is_admin()
  );

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can manage all payments"
  ON payments FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Anyone can read locations"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Drivers can insert locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE id = trip_id AND driver_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_stops_route_id ON stops(route_id);
CREATE INDEX IF NOT EXISTS idx_fares_route_id ON fares(route_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_trip_id ON payments(trip_id);
CREATE INDEX IF NOT EXISTS idx_locations_trip_id ON locations(trip_id);
CREATE INDEX IF NOT EXISTS idx_locations_timestamp ON locations(timestamp);

INSERT INTO routes (id, name, start_point, end_point, distance_km, estimated_time) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Lusaka - Kitwe Express', 'Lusaka Central', 'Kitwe CBD', 315.5, 240),
  ('00000000-0000-0000-0000-000000000002', 'City Center Loop', 'Cairo Road', 'Manda Hill', 12.3, 35),
  ('00000000-0000-0000-0000-000000000003', 'Chelstone - Town', 'Chelstone Mall', 'Cairo Road', 18.7, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO stops (route_id, name, latitude, longitude, order_index) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Lusaka Central Bus Station', -15.4067, 28.2871, 1),
  ('00000000-0000-0000-0000-000000000001', 'Great North Road Junction', -15.3500, 28.3200, 2),
  ('00000000-0000-0000-0000-000000000001', 'Kapiri Mposhi', -13.9833, 28.6667, 3),
  ('00000000-0000-0000-0000-000000000001', 'Kitwe CBD', -12.8044, 28.2136, 4),
  ('00000000-0000-0000-0000-000000000002', 'Cairo Road', -15.4201, 28.2836, 1),
  ('00000000-0000-0000-0000-000000000002', 'Ridgeway', -15.3950, 28.3200, 2),
  ('00000000-0000-0000-0000-000000000002', 'Manda Hill', -15.3897, 28.3251, 3),
  ('00000000-0000-0000-0000-000000000003', 'Chelstone Mall', -15.4500, 28.3500, 1),
  ('00000000-0000-0000-0000-000000000003', 'University Teaching Hospital', -15.3950, 28.2850, 2),
  ('00000000-0000-0000-0000-000000000003', 'Cairo Road', -15.4201, 28.2836, 3);

INSERT INTO fares (route_id, amount, currency) VALUES
  ('00000000-0000-0000-0000-000000000001', 80.00, 'ZMW'),
  ('00000000-0000-0000-0000-000000000002', 15.00, 'ZMW'),
  ('00000000-0000-0000-0000-000000000003', 20.00, 'ZMW');
