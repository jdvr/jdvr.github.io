---
title: 'GitHub, Pet projects visibility.'
tags:
  - api
  - github
  - python
  - scripts
id: 38
categories:
  - Programming
date: 2015-03-14 09:47:45
---

I start and update pet projects every week or at least every month, I always share it on GitHub and sometimes I tweet something related to this projects but others times I forgot, I just push it to GitHub and never say nothing to anybody.

Everybody check their twitter timeline at least once a day, but no every developer check his GitHub timeline so trying to share my pet projects in GitHub and give them more visibility, this week I have been writing and trying a GitHub updated share script.

Let's start with our script to share our daily repository updates. I code it with python.

**GitHub to Twitter**
1\. Create the a twitter app [here](https://apps.twitter.com/)
[![crear app](/images/2015/03/crear-app-300x164.png)](/images/2015/03/crear-app.png)
2\. Complete the form, you can leave the **callback** empty
3\. Once you have create your application, you have to explorer **_"Permissions"_** tab, and set it to **_"Read and Write"_**. And click Update Settings
[![set permissions](/images/2015/03/set-permissions-300x164.png)](/images/2015/03/set-permissions.png)
4\. We almost finish, now go yo **_Keys and Access Toke_ns** and click _**Regenerate Consumer Key and Secret**_ and **_Create my access token_**
[![create and regenerate](/images/2015/03/create-and-regenerate-300x231.png)](/images/2015/03/create-and-regenerate.png)
Now, we have to get the code and put the access information, then we set the Crontab task and forget about every thing it will work automatically.
5\. Start with the code, there are five files in [Yanepi](https://github.com/jdvr/Yanepi/tree/master/src) repo, we need to update some vars in order to make the script work with your accounts.
[**twitteracount.py:**](https://github.com/jdvr/Yanepi/blob/master/src/twitteraccounts.py)
[![relations](/images/2015/03/relations-300x58.jpg)](/images/2015/03/relations.jpg)
[**github.py:**](https://github.com/jdvr/Yanepi/blob/master/src/github.py)
You have to update this line with your user information: url, username and  password.
[![git config](/images/2015/03/git-config-300x9.png)](/images/2015/03/git-config.png)
<span style="color: #333333;font-size:60%;">Note: you can change the class name, I like how it is read: JuanVega().publish_tweet(some text)</span>
[**tasks.py:**](https://github.com/jdvr/Yanepi/blob/master/src/tasks.py)
update the message "visit me at..." this URL is for my git hub, so you must put your own URL
Just one more simple step, this is only for linux users, I will update this to windows user soon.
To do it independent I add it as a task in a computer that is always running.
1\. Open a terminal
2\. sudo crontab -e
3\. to configure your task follow the [crontab format](https://help.ubuntu.com/community/CronHowto)
in my case I use:
00 12 * * * python /path/to/yanpi.py
That is all; :-)
I hope you like this idea and you use the script or write your own, my next step is configure this script for automatic run it windows, and then add Linkedin api to share the change in twitter and linkedin.
finish();