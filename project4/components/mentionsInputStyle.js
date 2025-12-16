export default {
  control: {
    backgroundColor: '#fff',
    fontSize: 16,
    // fontWeight: 'normal',
  },
  '&multiLine': {
    control: {
      fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
      minHeight: 102,
      border: 'none',
      borderRadius: 4,
    },
    highlighter: {
      padding: '14.5px 12px',
      fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
    },
    input: {
      padding: '14.5px 12px',
      border: 0,
      outline: 'none',
      fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
    },
  },
  '&singleLine': {
    display: 'inline-block',
    width: 180,
    highlighter: {
      padding: 1,
    },
    input: {
      padding: 1,
    },
  },
  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid rgba(0,0,0,0.15)',
      fontSize: 16,
      fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
    },
    item: {
      padding: '5px 15px',
      borderBottom: '1px solid rgba(0,0,0,0.15)',
      fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
      '&focused': {
        backgroundColor: '#1976d214',
      },
    },
  },
};
