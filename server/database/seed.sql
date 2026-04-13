USE board_studio_system;

INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@boardstudio.test', '$2a$10$gQ0sM9Gf9E1sTrWyd4Inae8V4YDanFj0YPD6/COM24kTx5c.6EJDm', 'admin'),
('Thando Dube', 'thando@boardstudio.test', '$2a$10$gQ0sM9Gf9E1sTrWyd4Inae8V4YDanFj0YPD6/COM24kTx5c.6EJDm', 'customer');

INSERT INTO boards (material, width, height, stock_quantity) VALUES
('Melamine White Full Board', 2750, 1830, 42),
('Melamine White Half Board', 1375, 1830, 18),
('Oak Veneer Custom Board', 2440, 1220, 10);

INSERT INTO projects (user_id, name, width, height, depth, board_width, board_height, material) VALUES
(2, 'Kitchen Base Unit', 900, 720, 560, 2750, 1830, 'Melamine White');

INSERT INTO pieces (project_id, name, width, height, quantity, grain_direction, edging_top, edging_bottom, edging_left, edging_right) VALUES
(1, 'Left Side Panel', 560, 720, 1, 'fixed', 1, 1, 0, 1),
(1, 'Right Side Panel', 560, 720, 1, 'fixed', 1, 1, 1, 0),
(1, 'Top Panel', 900, 560, 1, 'flexible', 1, 0, 1, 1),
(1, 'Bottom Panel', 900, 560, 1, 'flexible', 0, 1, 1, 1),
(1, 'Back Panel', 900, 720, 1, 'fixed', 0, 0, 0, 0);

INSERT INTO products (name, description, category, price, image_url, stock_quantity, is_active) VALUES
('Oak Floating Shelf', 'Compact floating shelf finished in oak laminate. Perfect for modern kitchens and living spaces.', 'Shelves', 549.00, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop', 12, 1),
('Kitchen Drawer Front', 'Custom drawer front panel with edging included. Available in multiple finishes.', 'Panels', 329.00, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', 25, 1),
('White Melamine Offcut Pack', 'Useful offcut bundle for smaller furniture jobs. Includes various sizes and shapes.', 'Accessories', 199.00, 'https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=400&h=300&fit=crop', 30, 1);

INSERT INTO carts (user_id) VALUES (2);
