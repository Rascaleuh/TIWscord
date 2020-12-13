import {
  Button, TextField, Grid, CssBaseline, Paper, Box,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import HomeIcon from '@material-ui/icons/Home';
import SendIcon from '@material-ui/icons/Send';
import React, { useEffect, useState } from 'react';
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
    zIndex: 1,
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
  sendDiv: {
    position: 'absolute',
    bottom: '0.5rem',
  },
  conv: {
    height: 'calc(100vh - 90px)',
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
}));

// PEERJS
const peerConnection = {
  peer: null,
  conn: null,
};

function newPeer(id) {
  return new Peer(id, {
    host: 'localhost',
    port: 3000,
    path: '/mypeer',
  });
}

function DataChat({ id }) {
  const classes = useStyles();
  const [startAvailable, setStart] = useState(true);
  const [callAvailable, setSend] = useState(false);
  const [hangupAvailable, setHangup] = useState(false);
  const [dstId, setDstId] = useState('');
  const [msg, setMsg] = useState('');
  const [showConv, setShowConv] = useState(false);
  const [remoteIsTyping, setRemoteIsTyping] = useState(false);
  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    if (id !== '') {
      peerConnection.peer = newPeer(id);

      peerConnection.peer.on('connection', (conn) => {
        conn.on('data', (data) => {
          switch (data.type) {
            case 'MESSAGE':
              setConversation((oldConv) => [...oldConv, { value: data.value, type: 'rcv' }]);
              break;
            case 'TYPING':
              setRemoteIsTyping(true);
              break;
            case 'NOTYPING':
              setRemoteIsTyping(false);
              break;
            case 'DISCONNECT':
              peerConnection.peer.disconnect();
              peerConnection.conn = null;
              setRemoteIsTyping(false);
              setStart(true);
              setHangup(false);
              setShowConv(false);
              setConversation([]);
              break;
            default:
              break;
          }
        });
      });
    }
  }, []);

  const start = () => {
    peerConnection.conn = peerConnection.peer.connect(dstId);

    setShowConv(true);
    setSend(!callAvailable);
    setStart(!startAvailable);
  };

  const hangup = () => {
    peerConnection.conn.send({ type: 'DISCONNECT' });
    peerConnection.peer.disconnect();
    peerConnection.conn = null;
    setRemoteIsTyping(false);
    setStart(true);
    setHangup(false);
    setShowConv(false);
    setConversation([]);
  };

  const send = () => {
    peerConnection.conn.send({ type: 'MESSAGE', value: msg });
    setConversation([...conversation, { value: msg, type: 'snd' }]);
    setMsg('');
  };

  const handleOnFocus = () => {
    peerConnection.conn.send({ type: 'TYPING' });
  };

  const handleOnBlur = () => {
    peerConnection.conn.send({ type: 'NOTYPING' });
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
            <Button onClick={hangup} disabled={hangupAvailable} className={classes.hangup}>
              Hang Up
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {
        showConv
        && (
        <Grid
          container
          direction="column-reverse"
          alignItems="center"
          justify="center"
          className={classes.conv}
        >
          <Grid container justify="center" alignItems="center" className={classes.sendDiv}>
            <Grid item sm={8}>
              <TextField
                label="🗣 Message"
                value={msg}
                variant="outlined"
                size="small"
                fullWidth
                onChange={(e) => setMsg(e.target.value)}
                onFocus={handleOnFocus}
                onBlur={handleOnBlur}
              />
            </Grid>
            <Grid item>
              <Button className={classes.send} onClick={send}>
                <SendIcon />
              </Button>
            </Grid>
          </Grid>
          <Grid
            container
            direction="column"
          >
            {
              conversation.map((message) => (
                <Grid
                  item
                  align={message.type === 'snd' ? 'right' : 'left'}
                  key={`${message.type}_${Math.random().toString(36).substring(7)}`}
                >
                  <Box
                    component="span"
                    className={message.type === 'snd' ? classes.snd : classes.rcv}
                  >
                    {message.value}
                  </Box>
                </Grid>
              ))
            }
            {
              remoteIsTyping
              && (
                <Grid item align="left">
                  <Box
                    component="span"
                    className={classes.rcv}
                  >
                    ...
                  </Box>
                </Grid>
              )
            }
          </Grid>
        </Grid>
        )
      }
    </Grid>
  );
}

DataChat.propTypes = {
  id: PropTypes.string.isRequired,
};

export default DataChat;
