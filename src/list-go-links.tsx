import { useEffect, useState } from "react";
import {
  ActionPanel,
  Action,
  List,
  showToast,
  Toast,
  Icon,
} from "@raycast/api";
import {
  loadGoLinks,
  GoLinksError,
  GoLinksFile,
  getGoLinksPath,
} from "./go-links";

type LoadState =
  | { status: "loading" }
  | { status: "loaded"; links: GoLinksFile }
  | { status: "error"; message: string };

export default function Command() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    loadGoLinks()
      .then((links) => {
        if (!cancelled) setState({ status: "loaded", links });
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof GoLinksError ? err.message : (err as Error).message;
        setState({ status: "error", message });
        showToast({
          style: Toast.Style.Failure,
          title: "Cannot load local go-links file",
          message,
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <List isLoading={true} searchBarPlaceholder="Loading local aliases..." />
    );
  }

  if (state.status === "error") {
    return (
      <List searchBarPlaceholder="Error loading local go-links">
        <List.EmptyView
          icon={Icon.ExclamationMark}
          title="Cannot load local go-links file"
          description={state.message}
        />
      </List>
    );
  }

  const entries = Object.entries(state.links).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const filePath = getGoLinksPath();

  if (entries.length === 0) {
    return (
      <List searchBarPlaceholder="No local aliases defined">
        <List.EmptyView
          icon={Icon.Document}
          title="No aliases defined"
          description={`Add aliases to ${filePath} as a JSON object of "alias": "https://...".`}
        />
      </List>
    );
  }

  return (
    <List searchBarPlaceholder="Search local aliases...">
      <List.Section title={`Local — resolved in-memory from ${filePath}`}>
        {entries.map(([alias, template]) => {
          const hasPlaceholders = /\{\d+\}/.test(template);
          return (
            <List.Item
              key={alias}
              icon={Icon.Link}
              title={alias}
              subtitle={template}
              accessories={
                hasPlaceholders ? [{ tag: "needs args" }] : undefined
              }
              actions={
                <ActionPanel>
                  {!hasPlaceholders && <Action.OpenInBrowser url={template} />}
                  <Action.CopyToClipboard
                    title="Copy URL Template"
                    content={template}
                  />
                  <Action.CopyToClipboard title="Copy Alias" content={alias} />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
    </List>
  );
}
