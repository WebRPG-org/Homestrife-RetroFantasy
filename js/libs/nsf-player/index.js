const createNsfPlayer = (audioContext) => {
  const message = () => {};
  
  const timeCheck = (label) => {
	const curTime = Date.now();
	if(lastTime === undefined) {
		console.log(label + ": first call");
	} else {
		console.log(label + ": " + (curTime - lastTime) + "ms since previous call");
	}
	
	lastTime = curTime;
  };

  const play = (fileName, trackNo) => {
	for(let i = 0; i < nsfDatas.length; i++) {
		if(nsfDatas[i].fileName === fileName) {
			playMusicData(nsfDatas[i], trackNo);
			//updateSongInfo(fileName, trackNo);
			return;
		}
	}

    const xhr = new XMLHttpRequest();
    xhr.open('GET', fileName, true);
    xhr.responseType = 'arraybuffer';
    xhr.onerror = (e) => {
      message(e);
    };
    xhr.onload = function(e) {
      if (this.status === 404) {
        message('not found');
        return;
      }
	  const nsfData = {};
	  nsfData.fileName = fileName;
      nsfData.payload = new Uint8Array(this.response);
	  nsfDatas[nsfDatas.length] = nsfData;
	  
      playMusicData(nsfData, trackNo);
      //updateSongInfo(fileName, trackNo);
    };
    xhr.send();
  };

  const stop = () => {
    if (nsfDatas.length === 0) {
      return;
    }

	for(let i = 0; i < nsfDatas.length; i++) {
		//if(nsfDatas[i].emu === undefined) {
		//	continue;
		//}
		//Module.ccall('gme_set_tempo', 'number', ['number', 'number'], [nsfDatas[i].emu, 0.0]);
		//Module.ccall('gme_mute_voices', 'number', ['number', 'number'], [nsfDatas[i].emu, -1]);
		
		if(/*nsfDatas[i].emu === undefined || nsfDatas[i].outputBuffer === undefined ||*/ nsfDatas[i].node === undefined) {
			continue;
		}
		
		nsfDatas[i].node.disconnect();
		//nsfDatas[i].outputBuffer = undefined;
	
		//try {
		//  Module.ccall('gme_delete', 'number', ['number'], [nsfDatas[i].emu]);
		//  nsfDatas[i].emu = undefined;
		//} catch(exception) {
		//  console.log('Failed to stop track: ' + exception);
		//}
	}
  };

  let lastTime;
  const nsfDatas = [];

  const parseMetadata = ref => {
    let offset = 0;

    const read_int32 = () => {
       const value = Module.getValue(ref + offset, 'i32');
       offset += 4;
       return value;
     };

     const read_string = () => {
       const value = Module.Pointer_stringify(Module.getValue(ref + offset, 'i8*'));
       offset += 4;
       return value;;
     }

     const res = {};

     res.length = read_int32();
     res.intro_length = read_int32();
     res.loop_length = read_int32();
     res.play_length = read_int32();

     offset += 4*12; // skip unused bytes

     res.system = read_string();
     res.game = read_string();
     res.song = read_string();
     res.author = read_string();
     res.copyright = read_string();
     res.comment = read_string();

     return res;
  };

  const updateSongInfo = (filename, subtune) => {
   const subtune_count = Module.ccall('gme_track_count', 'number', ['number'], [emu]);

   if (Module.ccall('gme_track_info', 'number', ['number', 'number', 'number'], [emu, ref, subtune]) != 0) {
     console.error('Could not load metadata.');
   }

    const metadata = parseMetadata(Module.getValue(ref, '*'));

    message('playing', filename, metadata);
  };

  const playMusicData = (nsfData, subtune) => {
	stop();
	  
    if (!window.AudioContext) {
      if (window.webkitAudioContext) {
        window.AudioContext = window.webkitAudioContext;
      } else if (window.mozAudioContext) {
        window.AudioContext = window.mozAudioContext;
      } else {
        message('Web Audio API is not supported.');
      }
    }

    try {
      nsfData.ctx = nsfData.ctx || new AudioContext();
    } catch(err) {
      console.error(`Unable to create AudioContext. Error: ${err}`);
      return;
    }

    nsfData.ref = nsfData.ref || Module.allocate(1, 'i32', Module.ALLOC_STATIC);

    const samplerate = nsfData.ctx.sampleRate;

    if (Module.ccall('gme_open_data', 'number', ['array', 'number', 'number', 'number'], [nsfData.payload, nsfData.payload.length, nsfData.ref, samplerate]) != 0) {
      console.error('gme_open_data failed.');
      return;
    }

    nsfData.emu = nsfData.emu || Module.getValue(nsfData.ref, 'i32');

    //const subtune_count = Module.ccall('gme_track_count', 'number', ['number'], [nsfData.emu]);

    Module.ccall('gme_ignore_silence', 'number', ['number'], [nsfData.emu, 1]);

    //const voice_count = Module.ccall('gme_voice_count', 'number', ['number'], [nsfData.emu]);
    //message('Channel count: ', voice_count);
    //message('Track count: ', subtune_count);

    if (Module.ccall('gme_start_track', 'number', ['number', 'number'], [nsfData.emu, subtune]) != 0) {
      console.error('Failed to load track.');
    }

    const bufferSize = 1024 * 16;
    const inputs = 2;
    const outputs = 2;

    if (!nsfData.node && nsfData.ctx.createJavaScriptNode) {
      nsfData.node = nsfData.ctx.createJavaScriptNode(bufferSize, inputs, outputs);
    }
    if (!nsfData.node && nsfData.ctx.createScriptProcessor) {
      nsfData.node = nsfData.ctx.createScriptProcessor(bufferSize, inputs, outputs);
    }

    const buffer = Module.allocate(bufferSize * 2, 'i32', Module.ALLOC_STATIC);

    const INT16_MAX = Math.pow(2, 32) - 1;

    nsfData.node.onaudioprocess = (e) => {
	  nsfData.outputBuffer = e.outputBuffer;
      writeToOutputBuffer(e.outputBuffer);
    };
	
	const writeToOutputBuffer = (outputBuffer) => {
	  if (Module.ccall('gme_track_ended', 'number', ['number'], [nsfData.emu]) == 1) {
        nsfData.node.disconnect();
		nsfData.outputBuffer = undefined;
		nsfData.emu = undefined;
        message('End of stream.');
        return;
      }

      const channels = [outputBuffer.getChannelData(0), outputBuffer.getChannelData(1)];

      const err = Module.ccall('gme_play', 'number', ['number', 'number', 'number'], [nsfData.emu, bufferSize * 2, buffer]);
      for (var i = 0; i < bufferSize; i++) {
        for (var n = 0; n < outputBuffer.numberOfChannels; n++) {
          channels[n][i] = Module.getValue(buffer + i * outputBuffer.numberOfChannels * 2 + n * 4, 'i32') / INT16_MAX;
        }
      }
	};
	
	//Module.ccall('gme_set_tempo', 'number', ['number', 'number'], [nsfData.emu, 1.0]);
	//Module.ccall('gme_mute_voices', 'number', ['number', 'number'], [nsfData.emu, 0]);

    nsfData.node.connect(nsfData.ctx.destination);
	if(nsfData.outputBuffer !== undefined) {
		writeToOutputBuffer(nsfData.outputBuffer);
	}
  };

  return { play, stop };
};
