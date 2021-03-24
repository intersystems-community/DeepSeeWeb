ARG IMAGE=store/intersystems/iris-aa-community:2020.3.0AA.331.0
ARG IMAGE=intersystemsdc/iris-community:2020.2.0.196.0-zpm
ARG IMAGE=intersystemsdc/iris-aa-community:2020.3.0AA.331.0-zpm
ARG IMAGE=intersystemsdc/iris-community:2020.3.0.200.0-zpm
ARG IMAGE=intersystemsdc/irishealth-community:2020.4.0.524.0-zpm
FROM $IMAGE

USER root
WORKDIR /opt/irisapp
RUN chown ${ISC_PACKAGE_MGRUSER}:${ISC_PACKAGE_IRISGROUP} /opt/irisapp

COPY irissession.sh /
RUN chmod +x /irissession.sh

USER ${ISC_PACKAGE_MGRUSER}

# copy files
COPY  Installer.cls .
# COPY  src src
# COPY iris.script /tmp/iris.script
SHELL ["/irissession.sh"]

RUN \
do $SYSTEM.OBJ.Load("Installer.cls", "ck") \
  set sc = ##class(App.Installer).setup() \
  zn "IRISAPP" \
  zpm "install dsw" \
  zpm "install samples-bi"

# bringing the standard shell back
SHELL ["/bin/bash", "-c"]

# special extract treatment for hate-speech dataset
# RUN mkdir /data/hate-speech/ \
#	&& tar -xf /data/hate-speech.tar -C /data/

# load demo stuff
RUN iris start IRIS
RUN rm -r /usr/irissys/csp/dsw/*
COPY /home/runner/work/DeepSeeWeb/DeepSeeWeb/dist/* /usr/irissys/csp/dsw/
