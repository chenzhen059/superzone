git add .

if [ "$1" ]; then
    msg=$1
else
    msg="update at `date`"
fi

git commit -m "$msg"

git push origin master

# ssh -i X:/web_server/server_key/key/root  root@106.54.141.111 "cd /data/superzone/ ; sh release.sh"