import {
  Container, CssBaseline, Typography, Avatar, TextField, Grid, Button,
} from '@material-ui/core';
import ForumIcon from '@material-ui/icons/Forum';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  main: {
    height: '100vh',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  icon: {
    height: theme.spacing(7),
    width: theme.spacing(7),
    margin: theme.spacing(1),
    backgroundColor: '#a4508b',
    backgroundImage: 'linear-gradient(326deg, #a4508b 0%, #5f0a87 74%)',
  },
  grid: {
    marginTop: theme.spacing(2),
  },
  button: {
    textTransform: 'uppercase',
    padding: '1rem 2rem',
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: '#a4508b',
    backgroundImage: 'linear-gradient(326deg, #a4508b 0%, #5f0a87 74%)',
  },
  link: {
    textDecoration: 'none',
  },
}));

function Home({ id, setId }) {
  const classes = useStyles();

  const handleLink = (e) => {
    if (id === '') {
      e.preventDefault();
    }
  };

  return (
    <Container component="main" maxWidth="xs" className={classes.main}>
      <CssBaseline />
      <Avatar className={classes.icon}>
        <ForumIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        TIWscord
      </Typography>
      <Grid
        container
        spacing={2}
        className={classes.grid}
        alignItems="center"
        justify="center"
      >
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            autoFocus
            variant="outlined"
            label="Username"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </Grid>
        <Grid item align="center">
          <Link to="/chat" onClick={(e) => handleLink(e)} className={classes.link}>
            <Button
              variant="contained"
              className={classes.button}
            >
              Chat
            </Button>
          </Link>
        </Grid>
        <Grid item align="center">
          <Link to="/video" onClick={(e) => handleLink(e)} className={classes.link}>
            <Button
              variant="contained"
              className={classes.button}
            >
              Vocal
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
}

Home.propTypes = {
  id: PropTypes.string.isRequired,
  setId: PropTypes.func.isRequired,
};

export default Home;
