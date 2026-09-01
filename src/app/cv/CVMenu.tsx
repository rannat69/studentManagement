import styles from "./styles.module.css";

// Replace 'string' with a Union Type like 'config' | 'upload' if you have specific pages
type Page = string;

export default function CVMenu({
  setPage,
  activePage,
  user,
}: {
  setPage: React.Dispatch<React.SetStateAction<Page>>;
  activePage: Page;
  user: string;
}) {
  return (
    <nav className={styles.navMenu}>
      <button
        className={
          activePage === ""
            ? `${styles.navButton} ${styles.navButtonActive}`
            : styles.navButton
        }
        onClick={() => setPage("")}
      >
        Main
      </button>

      {(user === "remia" || user === "tristanb") && (
        <button
          className={
            activePage === "config"
              ? `${styles.navButton} ${styles.navButtonActive}`
              : styles.navButton
          }
          onClick={() => setPage("config")}
        >
          Config
        </button>
      )}
    </nav>
  );
}
