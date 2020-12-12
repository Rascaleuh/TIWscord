import React, { useState, useRef } from 'react';
import {
  Button, TextField, Grid,
} from '@material-ui/core';
import Peer from 'peerjs';

// PEERJS
const peerConnection = {
  peer: null,
  conn: null,
};

// function newPeer(id) {
//   return new Peer(id, {
//     host: 'tp3-idoux-vialatoux.herokuapp.com',
//     path: '/mypeer',
//   });
// }

function newPeer(id) {
  return new Peer(id, {
    host: 'localhost',
    port: 3000,
    path: '/mypeer',
  });
}

function VideoChat() {
  const [startAvailable, setStart] = useState(true);
  const [callAvailable, setCall] = useState(false);
  const [hangupAvailable, setHangup] = useState(false);
  const [srcId, setSrcId] = useState('');
  const [dstId, setDstId] = useState('');
  const localVideoRef = useRef();
  const localStreamRef = useRef();
  const remoteVideoRef = useRef();

  const gotStream = (stream) => {
    localVideoRef.current.srcObject = stream;
    setCall(true);
    localStreamRef.current = stream;
  };

  const gotRemoteStream = (remoteStream) => {
    const remoteVideo = remoteVideoRef.current;
    if (remoteVideo.srcObject !== remoteStream) {
      remoteVideo.srcObject = remoteStream;
    }
  };

  const start = () => {
    peerConnection.peer = newPeer(srcId);
    peerConnection.conn = peerConnection.peer.connect(dstId);

    // Receive DISCONNECT message
    peerConnection.peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        if (data === 'DISCONNECT') {
          conn.close();
          peerConnection.peer.destroy();
          gotRemoteStream(null);
          setHangup(false);
        }
      });
    });

    setStart(false);
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then(gotStream)
      .catch((e) => { console.log(e); alert(`getUserMedia() error: ${e.name}`); });
  };

  const sendmessage = () => {
    // Send Manual disconnect message
    peerConnection.conn.send('DISCONNECT');
    return true;
  };

  const hangup = () => {
    if (sendmessage()) {
      // Disconnect myself
      peerConnection.peer.disconnect();
      setHangup(false);
      gotRemoteStream(null);
    }
  };

  const callDst = () => {
    const getUserMedia = navigator.getUserMedia
      || navigator.webkitGetUserMedia
      || navigator.mozGetUserMedia;

    // Get VIDEO
    getUserMedia({ video: true, audio: true }, (stream) => {
      const call = peerConnection.peer.call(dstId, stream);
      call.on('stream', (remoteStream) => {
        gotRemoteStream(remoteStream);
      });
    }, (err) => {
      console.log('Failed to get local stream', err);
    });

    // Receive VIDEO
    peerConnection.peer.on('call', (call) => {
      getUserMedia({ video: true, audio: true }, (stream) => {
        call.answer(stream); // Answer the call with an A/V stream.
        call.on('stream', (remoteStream) => {
          gotRemoteStream(remoteStream);
        });
      }, (err) => {
        console.log('Failed to get local stream', err);
      });
    });

    setHangup(true);
  };

  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
    >
      <Grid item>
        <TextField
          label="Votre identifiant"
          placeholder="Monsieur A"
          variant="outlined"
          onChange={(e) => setSrcId(e.target.value)}
        />
        <TextField
          label="Identifiant destinataire"
          placeholder="Monsieur B"
          variant="outlined"
          onChange={(e) => setDstId(e.target.value)}
        />
      </Grid>

      <Grid item>
        <Button onClick={start} disabled={!startAvailable}>
          Start
        </Button>
        <Button onClick={callDst} disabled={!callAvailable}>
          Call
        </Button>
        <Button onClick={hangup} disabled={!hangupAvailable}>
          Hang Up
        </Button>
      </Grid>
      <video
        ref={localVideoRef}
        autoPlay
        muted
      >
        <track kind="captions" srcLang="en" label="english_captions" />
      </video>
      <video
        ref={remoteVideoRef}
        autoPlay
      >
        <track kind="captions" srcLang="en" label="english_captions" />
      </video>
    </Grid>
  );
}

export default VideoChat;
