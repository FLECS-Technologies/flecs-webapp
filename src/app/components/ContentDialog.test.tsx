import { render, fireEvent } from '@testing-library/react';
import ContentDialog from '../ContentDialog';

describe('Content Dialog', () => {
  let open = true;
  let testButtonCalled = false;
  function setOpen() { open = !open; }
  function handleTestButton() { testButtonCalled = true; }

  test('renders content dialog component', () => {
    const { getByTestId } = render(
      <ContentDialog open={open} title={'Test Dialog'} setOpen={setOpen} actions={null} />,
    );
    const closeButton = getByTestId('close-button');
    const diagTitle = getByTestId('content-dialog-title');
    expect(diagTitle).toHaveTextContent('Test Dialog');
    fireEvent.click(closeButton);
    expect(open).toBeFalsy();
  });

  test('renders content dialog with custom actions', () => {
    open = true;
    const { getByTestId } = render(
      <ContentDialog
        open={open}
        title={'Test Dialog'}
        content={null}
        setOpen={setOpen}
        actions={
          <button data-testid="test-button" onClick={handleTestButton}>Test</button>
        }
      />,
    );
    const testButton = getByTestId('test-button');
    const diagTitle = getByTestId('content-dialog-title');
    expect(diagTitle).toHaveTextContent('Test Dialog');
    fireEvent.click(testButton);
    expect(testButtonCalled).toBeTruthy();
    expect(() => getByTestId('close-button')).toThrow();
  });
});
