import {
  Button, TextField, Grid,
} from '@material-ui/core';
import React, { useState } from 'react';
import Peer from 'peerjs';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  rcv: {
    background: 'red',
  },
  snd: {
    background: 'green',
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

function DataChat() {
  const classes = useStyles();
  const [startAvailable, setStart] = useState(true);
  const [callAvailable, setSend] = useState(false);
  const [hangupAvailable, setHangup] = useState(false);
  const [srcId, setSrcId] = useState('');
  const [dstId, setDstId] = useState('');
  const [msg, setMsg] = useState('');
  const [conversation, setConversation] = useState([]);

  // TODO: Créer un message d'erreur si le nom est vide !
  const start = () => {
    peerConnection.peer = newPeer(srcId);
    peerConnection.conn = peerConnection.peer.connect(dstId);

    peerConnection.peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        setConversation((oldConv) => [...oldConv, { value: data, type: 'rcv' }]);
      });
    });
    setSend(!callAvailable);
    setStart(!startAvailable);
  };

  const hangup = () => {
    peerConnection.peer.disconnect();
    setHangup(!hangupAvailable);
    setSend(!callAvailable);
  };

  const send = () => {
    peerConnection.conn.send(msg);
    setConversation([...conversation, { value: msg, type: 'snd' }]);
  };

  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
    >
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
          <Button onClick={hangup} disabled={hangupAvailable}>
            Hang Up
          </Button>
        </Grid>
      </Grid>
      <Grid
        container
        justify="center"
        alignItems="center"
      >
        <TextField
          required
          id="filled-required"
          label="Message"
          placeholder="Votre message"
          variant="outlined"
          onChange={(e) => setMsg(e.target.value)}
        />
        <Button onClick={send} disabled={!callAvailable}>
          Send
        </Button>
      </Grid>
      <Grid item>
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
          className={classes.conversation}
        >
          {
            conversation.map((conv) => (
              <Grid
                item
                className={conv.type === 'snd' ? classes.snd : classes.rcv}
                key={`${conv.type}_${new Date().getTime()}`}
              >
                {conv.value}
              </Grid>
            ))
          }
        </Grid>
      </Grid>
    </Grid>
  );
}
export default DataChat;
