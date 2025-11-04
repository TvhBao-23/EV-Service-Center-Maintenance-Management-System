#!/bin/bash
# Script to import test data into Docker MySQL container
# This imports add_test_data_heidi.sql into the Docker MySQL database

echo "Importing add_test_data_heidi.sql into Docker MySQL container..."

docker compose exec -T maintenance-mysql mysql -uevsc -pevsc ev_service_center < database/add_test_data_heidi.sql

echo "Import complete!"

