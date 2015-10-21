"use strict";
var
  gutil        =require("gulp-util"),
  through      =require("through2"),
  PumlRenderer =require("esf-puml").PumlRenderer,
  streamBuffers=require("stream-buffers"),
  stream       =require("stream"),
  path         =require("path")
  ;

module.exports=function(options){

  options=options||{
    "format":"svg"
  };

  return through.obj(function(file,enc,cb){

    if(file.isNull()){
      cb(null,file);
      return;
    }

    var rdr=new PumlRenderer();
    var fmt="svg";

    if(options.format&&(
        options.format==="png"||
        options.format==="svg"||
        options.format==="eps"
      )){
      fmt=options.format;
    }

    if(file.isBuffer()){

      try{

        var rdblStmBfr=new streamBuffers.ReadableStreamBuffer({
          "frequency":10,
          "chunkSize":1024*4
        });

        let fcnt=file.contents;
        let ccwd=null||options.cwd||file.cwd;

        file.contents=rdblStmBfr.pipe(rdr.stream(fmt,ccwd));

        rdblStmBfr.put(fcnt,"utf8");

        rdblStmBfr.destroySoon();

      }catch(e){
        this.emit("error",new gutil.PluginError("gulp-puml",e));
      }

    }else if(file.isStream()){
      try{

        file.contents=file.contents.pipe(rdr.stream(fmt));

      }catch(e){
        this.emit("error",new gutil.PluginError("gulp-puml",e));
      }

    }

    if(file.path){
      file.path=file.path.replace(/\.puml/ig,"."+fmt);
    }

    cb(null,file);

  });
};
