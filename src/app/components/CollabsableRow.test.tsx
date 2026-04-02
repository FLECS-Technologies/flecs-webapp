import { render, screen, fireEvent } from '@testing-library/react';
import CollapsableRow from '../CollapsableRow';

describe('CollabsableRow', () => {
  test('renders CollabsableRow component', async () => {
    render(
      <table><tbody>
        <CollapsableRow title="Test Title"></CollapsableRow>
      </tbody></table>,
    );
    expect(screen.getByText('Test Title')).toBeVisible();
  });

  test('click expand button', async () => {
    render(
      <table><tbody>
        <CollapsableRow title="Test Title">
          <p>This is inside</p>
        </CollapsableRow>
      </tbody></table>,
    );
    const expandButton = screen.getByTestId('expand-button');
    fireEvent.click(expandButton);
    expect(screen.getByText('Test Title')).toBeVisible();
    expect(screen.getByText('This is inside')).toBeVisible();
  });
});
