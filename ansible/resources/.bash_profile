# .bash_profile

# Get the aliases and functions
if [ -f ~/.bashrc ]; then
	. ~/.bashrc
fi

# User specific environment and startup programs
export PATH=/home/spht/.local/bin:/usr/local/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/lib:/usr/local/lib64

AWS_SECRETS_KEY=spht-production
