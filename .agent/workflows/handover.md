---
description: Update the HANDOVER.md file, commit changes, and push to repository.
---

# Handover Workflow

This workflow updates the `HANDOVER.md` file with the latest context and ensures everything is saved to the repository.

1.  **Update HANDOVER.md**
    - The agent should review the current session's progress.
    - Update `HANDOVER.md` adding new accomplishments, architecture changes, or known issues to the relevant sections.
    - Ensure "Next Steps" reflects immediate needs.

2.  **Commit and Push**
    - Run the following command to save the state:
    ```bash
    git add HANDOVER.md
    git commit -m "Chore: Update HANDOVER.md protocol"
    git push
    ```

// turbo
3.  **Notify User**
    - Confirm that the handover file is updated and pushed.
