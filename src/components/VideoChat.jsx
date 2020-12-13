import React, { useState, useRef, useEffect } from 'react';
import {
  Button, TextField, Grid, CssBaseline, Paper, ButtonGroup,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import HomeIcon from '@material-ui/icons/Home';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideoCamIcon from '@material-ui/icons/Videocam';
import VideoCamOffIcon from '@material-ui/icons/VideocamOff';
import Peer from 'peerjs';
import { makeStyles } from '@material-ui/core/styles';

import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  grid: {
    height: '100vh',
  },
  paper: {
    padding: theme.spacing(2),
    width: '100vw',
  },
  start: {
    textTransform: 'uppercase',
    padding: '0.5rem 1rem',
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: '#a4508b',
    backgroundImage: 'linear-gradient(326deg, #a4508b 0%, #5f0a87 74%)',
  },
  hangup: {
    textTransform: 'uppercase',
    padding: '0.5rem 1rem',
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: '#F00000',
    backgroundImage: 'linear-gradient(to right, #DC281E, #F00000)',
  },
  send: {
    marginLeft: '1.5rem',
    color: 'white',
    padding: '0.5rem 1rem',
    backgroundColor: '#a4508b',
    backgroundImage: 'linear-gradient(326deg, #a4508b 0%, #5f0a87 74%)',
  },
  call: {
    height: '100vh',
    backgroundColor: '#2c3238',
  },
  fullWidth: {
    width: '100%',
  },
  rcv: {
    display: 'inline-block',
    marginBottom: '0.5rem',
    marginLeft: '2rem',
    fontWeight: 'bold',
    color: 'white',
    padding: '0.5rem 1rem',
    background: '#a4508b',
    borderRadius: '20px 20px 20px 0px',
  },
  snd: {
    display: 'inline-block',
    marginBottom: '0.5rem',
    marginRight: '2rem',
    fontWeight: 'bold',
    color: 'white',
    padding: '0.5rem 1rem',
    background: '#5f0a87',
    borderRadius: '20px 20px 0px 20px',
  },
  conversation: {
    background: 'grey',
    width: '20rem',
  },
  video: {
    textAlign: 'center',
  },
}));

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

function VideoChat({ id }) {
  const [startAvailable, setStart] = useState(true);
  const [callAvailable, setCall] = useState(false);
  const [hangupAvailable, setHangup] = useState(false);
  const [dstId, setDstId] = useState('');
  const localVideoRef = useRef();
  const localStreamRef = useRef();
  const remoteVideoRef = useRef();
  const classes = useStyles();

  const gotMute = (myBool) => {
    if (localStreamRef.current != null) {
      if (localStreamRef.current.getAudioTracks() != null) {
        console.log(localStreamRef.current.getAudioTracks()[0]);
        localStreamRef.current.getAudioTracks()[0].enabled = myBool;
      }
    }
  };

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

  useEffect(() => {
    if (id !== '') {
      peerConnection.peer = newPeer(id);

      peerConnection.peer.on('open', (ide) => {
        console.log(ide);
      });

      peerConnection.peer.on('connection', (conn) => {
        console.log('connected');
        conn.on('data', (data) => {
          switch (data.type) {
            case 'DISCONNECT':
              conn.close();
              peerConnection.peer.destroy();
              gotRemoteStream(null);
              setHangup(false);
              break;
            default:
              break;
          }
        });
      });
    }
  }, []);

  const start = () => {
    // peerConnection.peer = newPeer(srcId);
    peerConnection.conn = peerConnection.peer.connect(dstId);

    setStart(false);
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then(gotStream)
      .catch((e) => { console.log(e); alert(`getUserMedia() error: ${e.name}`); });
  };

  const hangup = () => {
    peerConnection.conn.send({ type: 'DISCONNECT' });
    peerConnection.peer.disconnect();
    setHangup(false);
    gotRemoteStream(null);
  };

  const start2 = () => {
    peerConnection.conn = peerConnection.peer.connect(dstId);

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then(gotStream)
      .catch((e) => { console.log(e); alert(`getUserMedia() error: ${e.name}`); });
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
      // let acceptCall = confirm("ON T'APPEL TACCEPT ?");
      const acceptCall = true;
      if (acceptCall) {
        getUserMedia({ video: true, audio: true }, (stream) => {
          console.log('we received a call !');
          call.answer(stream); // Answer the call with an A/V stream.
          call.on('stream', (remoteStream) => {
            gotRemoteStream(remoteStream);
          });
        }, (err) => {
          console.log('Failed to receive others stream', err);
        });
      }
    });

    setHangup(true);
  };

  return (
    <Grid
      container
      className={classes.grid}
    >
      <CssBaseline />
      <Paper elevation={1} className={classes.paper}>
        <Grid container spacing={2} justify="center" alignItems="center">
          <Grid item>
            <Link to="/" className={classes.link}>
              <HomeIcon />
            </Link>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Your Username"
              variant="outlined"
              fullWidth
              value={id}
              InputProps={{
                readOnly: true,
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Remote username"
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => setDstId(e.target.value)}
            />
          </Grid>
          <Grid item>
            <Button onClick={start} disabled={!startAvailable} className={classes.start}>
              Start
            </Button>
          </Grid>
          <Grid item>
            <Button onClick={callDst} disabled={!callAvailable} className={classes.start}>
              Call
            </Button>
          </Grid>
          <Grid item>
            <Button onClick={hangup} className={classes.hangup}>
              Hang Up
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Grid
        container
        spacing={2}
        direction="row"
        justify="center"
        alignItems="center"
        className={classes.call}
      >
        <Grid
          item
          xs={6}
          className={classes.video}
        >
          <video
            ref={localVideoRef}
            autoPlay
            style={{ transform: 'rotateY(180deg)', borderRadius: '5%', width: '75%' }}
            id="videoId"
          >
            <track kind="captions" srcLang="en" label="english_captions" />
          </video>
          <Grid item>
            <ButtonGroup variant="contained" style={{ color: 'white' }} aria-label="contained primary button group">
              <Button>
                <VideoCamIcon style={{ color: 'rgb(76, 175, 80)' }} />
              </Button>
              <Button>
                <VideoCamOffIcon color="secondary" />
              </Button>
              <Button onClick={gotMute(false)}>
                <MicIcon style={{ color: 'rgb(76, 175, 80)' }} />
              </Button>
              <Button onClick={gotMute(true)}>
                <MicOffIcon color="secondary" />
              </Button>
            </ButtonGroup>
          </Grid>
        </Grid>
        <Grid
          item
          xs={6}
          className={classes.video}
        >
          <video
            ref={remoteVideoRef}
            autoPlay
            style={{ transform: 'rotateY(180deg)', borderRadius: '5%', width: '75%' }}
          >
            <track kind="captions" srcLang="en" label="english_captions" />
          </video>
        </Grid>
      </Grid>
    </Grid>
  );
}

VideoChat.propTypes = {
  id: PropTypes.string.isRequired,
};

export default VideoChat;
