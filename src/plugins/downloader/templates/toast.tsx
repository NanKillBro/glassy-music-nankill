/**
 * Transient status line for download progress.
 *
 * The plugin's other feedback surface is the label of the button inside the song menu,
 * which is only on screen while that menu is open - a download started from the app menu
 * reported nothing. This sits above the player bar instead, so progress is visible
 * wherever the download was triggered from.
 */
export const DownloadToast = (props: { text: string }) => (
  <div
    class="ytmd-downloader-toast"
    classList={{ 'ytmd-downloader-toast--visible': !!props.text }}
  >
    {props.text}
  </div>
);
