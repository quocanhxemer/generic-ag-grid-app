#!/bin/sh

# This script try generating the database and run the server

until npm run generate
do
    echo "Failed to generate default database, restarting..."
    # wait until mysql server is stable
    sleep 2
done

exec npm start
