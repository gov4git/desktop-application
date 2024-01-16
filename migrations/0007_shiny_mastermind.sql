CREATE VIRTUAL TABLE `motionsFullTextSearch` USING fts5(
	`trackerUrl`,
	`title`,
	`description`,
  content='motions',
  content_rowid='id',
  tokenize = 'porter unicode61 remove_diacritics 2'
);
--> statement-breakpoint
CREATE TRIGGER motions_ai AFTER INSERT ON motions
    BEGIN
        INSERT INTO motionsFullTextSearch (rowid, trackerUrl, title, description)
        VALUES (new.id, new.trackerUrl, new.title, new.description);
    END;
--> statement-breakpoint
CREATE TRIGGER motions_ad AFTER DELETE ON motions
    BEGIN
        INSERT INTO motionsFullTextSearch (motionsFullTextSearch, rowid, trackerUrl, title, description)
        VALUES ('delete', old.id, old.trackerUrl, old.title, old.description);
    END;
--> statement-breakpoint
CREATE TRIGGER motions_au AFTER UPDATE ON motions
    BEGIN
        INSERT INTO motionsFullTextSearch (motionsFullTextSearch, rowid, trackerUrl, title, description)
        VALUES ('delete',  old.id, old.trackerUrl, old.title, old.description);
        INSERT INTO motionsFullTextSearch (rowid, trackerUrl, title, description)
        VALUES (new.id, new.trackerUrl, new.title, new.description);
    END;
