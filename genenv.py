import os

def get_config_from_environment(env_content):
    # get config from env
    env_content += "DB_USER={}\n".format(os.environ.get("DB_USER", ""))
    env_content += "DB_PASS={}\n".format(os.environ.get("DB_PASS", ""))
    env_content += "DB_NAME={}\n".format(os.environ.get("DB_NAME", ""))
    env_content += "TEST={}\n".format(os.environ.get("TEST", ""))
    return env_content

env_content = ""
env_content = get_config_from_environment(env_content)

with open(".env", "w", encoding="utf8") as env:
    env.write(env_content)