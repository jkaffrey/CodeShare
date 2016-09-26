# CodeShare

CodeShare is app designed to simplify paired programming. Once an individual signs up, they can then create repositories. These repositories contain a folder structure within them for file management. The files within these repositories can then be viewed and edited by multiple users at the sametime given they were invited to collaborate on the project. The repositiories also have a built in compiler where users can run their code live on the website and see the output. Users also have permissions on what they can do with repositories that they have access to. These roles are Owner, Admin, Collaborator, Viewer and Guest. Bellow is the permissions that are associated with each of these roles.

Owner
* Delete Repository
* Add Users
* Edit the Repository
* View the Repository

Admin
* Add Users
* Edit the Repository
* View the Repository

Collaborator
* Edit the Repository
* View the Repository

Viewer
* View the Repository

Guest
* View ANY repository on the website
* This is a debugging feature and is only directly assignable through a SQL command.

## Technical Details
CodeShare was design using NodeJS and Express for the brunt of the work. HandleBars was used to render the various page views.


