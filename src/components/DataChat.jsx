import {
  Button, TextField, Grid, CssBaseline, Paper, Box, Avatar, Hidden
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import HomeIcon from '@material-ui/icons/Home';
import SendIcon from '@material-ui/icons/Send';
import React, { useEffect, useState } from 'react';
import Peer from 'peerjs';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  main: {
    height: '100vh',
    flexWrap: 'nowrap',
  },
  header: {
    flexGrow: '0',
    width: '100vw',
  },
  headerItem: {
    padding: '0.5rem',
  },
  link: {
    textDecoration: 'none',
  },
  homeIcon: {
    color: 'white',
    backgroundColor: '#a4508b',
    backgroundImage: 'linear-gradient(326deg, #a4508b 0%, #5f0a87 74%)',
    padding: '0.5rem',
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
  conversationGrid: {
    flexGrow:1,
    overflow: 'hidden',
    paddingBottom: '0.5rem',
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
  messages: {
    flexGrow: '1',
    flexWrap: 'nowrap',
    overflow: 'auto',
    padding: '1rem 1rem',
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
  const [showConv, setShowConv] = useState(true);
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

  const handleOnKeyDown = (e) => {
    if (e.key === 'Enter') {
      send();
      document.getElementById('sendMessage').blur();
    }
  }

  return (
    <Grid
      container
      direction="column"
      className={classes.main}
    >
      <CssBaseline />
      <Paper elevation={1} className={classes.header}>
        <Grid container justify="center" alignItems="center">
          <Grid item className={classes.headerItem}>
            <Link to="/" className={classes.link}>
              <Avatar className={classes.homeIcon}>
                <HomeIcon />
              </Avatar>
            </Link>
          </Grid>
          <Grid item xs={12} sm={3} className={classes.headerItem}>
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
          <Grid item xs={12} sm={3} className={classes.headerItem}>
            <TextField
              label="Remote username"
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => setDstId(e.target.value)}
            />
          </Grid>
          <Grid item className={classes.headerItem}>
            <Button onClick={start} disabled={!startAvailable} className={classes.start}>
              Start
            </Button>
          </Grid>
          <Grid item className={classes.headerItem}>
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
          className={classes.conversationGrid}
        >
          <Grid container justify="center" alignItems="center">
            <Grid item sm={8}>
              <TextField
                id="sendMessage"
                label="🗣 Message"
                value={msg}
                variant="outlined"
                size="small"
                fullWidth
                onChange={(e) => setMsg(e.target.value)}
                onFocus={handleOnFocus}
                onBlur={handleOnBlur}
                onKeyDown={handleOnKeyDown}
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
            className={classes.messages}
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
