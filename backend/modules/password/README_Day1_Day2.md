# Password Management (Service 2) - Day 1 & Day 2

This folder contains the helper files I wrote for the password management service.

## Files added:

### 1. passwordValidator.js
This file checks if the password the user entered is strong enough before we hash and save it. It simply makes sure the password is at least 8 characters long and includes a number, an uppercase letter, and a lowercase letter.

### 2. emailService.js
This is a basic email sender function for the "forgot password" feature. Right now it just prints out the reset link to the console using localhost. Later on, we can hook it up to an actual email provider to send real emails to students.
