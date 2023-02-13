@echo off
echo "Dont Close This Window. This Window Restarts The Bot incase of failure"
:Restart
start "Server" /wait "app.js"
echo "Bot has Crashed and It has been Restarted"
goto Restart