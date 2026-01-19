import GitHubIcon from '@mui/icons-material/GitHub';
import {
  Box,
  FormControlLabel,
  FormGroup,
  Link,
  Paper,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { TOOL } from '../src/tool';
import { useStore } from './Store';

export default function AppNav() {
  const {
    tool,
    setTool,
    removeFullyErased,
    setRemoveFullyErased,
    activeObject,
    erasable,
    erasableBackground,
    toggleErasableBackground,
    toggleErasable,
  } = useStore();

  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 2,
      }}
    >
      <Link href="/" sx={{ marginX: 8 }}>
        <Typography variant="h6">
          <strong>Erase2d</strong> App
        </Typography>
      </Link>

      <FormGroup row sx={{ alignItems: 'flex-end' }}>
        <FormControlLabel
          control={
            <ToggleButtonGroup
              color="primary"
              value={tool}
              onChange={(e, toolType) => setTool(toolType)}
              exclusive
            >
              {TOOL.map((toolType) => (
                <ToggleButton key={toolType} value={toolType}>
                  {toolType}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          }
          label={<Typography variant="caption">Action</Typography>}
          labelPlacement="bottom"
        />
        <FormControlLabel
          control={
            <Switch
              checked={removeFullyErased}
              onChange={(e) => setRemoveFullyErased(e.target.checked)}
            />
          }
          label={
            <Typography variant="caption">
              Remove fully erased objects
            </Typography>
          }
          labelPlacement="bottom"
        />
        <FormControlLabel
          control={
            <Switch
              checked={!!erasableBackground}
              onChange={(e) => toggleErasableBackground(e.target.checked)}
            />
          }
          label={<Typography variant="caption">Erasable background</Typography>}
          labelPlacement="bottom"
        />
        {activeObject && (
          <FormControlLabel
            control={
              <ToggleButtonGroup
                color="info"
                value={erasable}
                onChange={(e, value) =>
                  toggleErasable(
                    value === 'deep' ? value : Boolean(Number(value)),
                  )
                }
                exclusive
              >
                {[false, true, 'deep'].map((erasable) => (
                  <ToggleButton key={`erasable:${erasable}`} value={erasable}>
                    {erasable.toString()}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            }
            label={<Typography variant="caption">Erasable</Typography>}
            labelPlacement="bottom"
          />
        )}
      </FormGroup>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        <Link
          href="https://github.com/ShaMan123/erase2d"
          target="_blank"
          rel="noopener noreferrer"
          color="textPrimary"
          sx={{ marginX: 8 }}
        >
          <GitHubIcon />
        </Link>
      </Box>
    </Paper>
  );
}
