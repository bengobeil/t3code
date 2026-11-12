import { expect, it, vi } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "../../../test/render";
import { PendingReviewCommentCard } from "./PullRequestReviewAnnotation";

const comment = {
  id: "pending-1",
  body: "Should this retry on 502?",
  path: "src/app.ts",
  position: { kind: "added" as const, newLine: 42 },
};

it("saves an edited pending comment, and Cancel or Escape keep the original", async () => {
  const onEdit = vi.fn();
  await using screen = await render(
    <PendingReviewCommentCard
      comment={comment}
      completionScope={null}
      onEdit={onEdit}
      onRemove={vi.fn()}
    />,
  );
  const edit = () => screen.getByRole("button", { name: "Edit this comment" }).click();

  await edit();
  await userEvent.type(screen.getByRole("textbox"), " Or 503?");
  await screen.getByRole("button", { name: "Cancel" }).click();
  await expect.element(screen.getByText(comment.body)).toBeVisible();

  await edit();
  await expect.element(screen.getByRole("textbox")).toHaveValue(comment.body);
  await userEvent.keyboard("{Escape}");
  await expect.element(screen.getByText(comment.body)).toBeVisible();

  await edit();
  await userEvent.type(screen.getByRole("textbox"), " Or 503?");
  await screen.getByRole("button", { name: "Save" }).click();
  expect(onEdit).toHaveBeenCalledExactlyOnceWith("Should this retry on 502? Or 503?");
  await expect.element(screen.getByRole("textbox")).not.toBeInTheDocument();
});
