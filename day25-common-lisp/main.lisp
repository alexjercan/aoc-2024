(defun read-all-lines ()
  (loop for line = (read-line *standard-input* nil nil)
        while line
        collect line))


(defun split-by-empty-string (lines)
  (let ((result nil)
        (current-group nil))
    (dolist (line lines (nreverse (if current-group
                                      (cons (nreverse current-group) result)
                                      result)))
      (if (string= line "")
          (when current-group
            (push (nreverse current-group) result)
            (setf current-group nil))
          (push line current-group)))))


(defun classify-schematic (schematic)
  (if (every (lambda (c) (char= c #\#)) (car schematic))
      'lock
      'key))


(defun compute-column-hashes (schematic)
  (let ((num-columns (length (car schematic))))
    (mapcar (lambda (col-index)
              (count #\# (mapcar (lambda (row) (aref row col-index)) schematic)))
            (loop for i below num-columns collect i))))


(defstruct schematic
  type         ; Type of the schematic: 'lock or 'key
  column-hashes) ; List of column hashes


(defun parse-schematic (schematic)
  (let ((type (classify-schematic schematic))
        (column-hashes (compute-column-hashes schematic)))
    (make-schematic :type type :column-hashes column-hashes)))


(defun parse-input ()
  (mapcar #'parse-schematic (split-by-empty-string (read-all-lines))))


(defun check-compatibility (schematic1 schematic2)
  (let* ((type1 (schematic-type schematic1))
         (type2 (schematic-type schematic2))
         (column-hashes1 (schematic-column-hashes schematic1))
         (column-hashes2 (schematic-column-hashes schematic2)))

    (unless (not (eq type1 type2))
      (return-from check-compatibility nil))

    (every (lambda (col1 col2)
             (<= (+ col1 col2) 7)) column-hashes1 column-hashes2)))


(defun count-compatible-pairs (schematics)
  (let ((count 0))
    (dotimes (i (length schematics))
      (dotimes (j (length schematics))
        (when (and (< i j)
                   (check-compatibility (nth i schematics) (nth j schematics)))
          (incf count))))
    count))


(defun main ()
  (let ((schematics (parse-input)))
    (format t "Part1: ~D~%" (count-compatible-pairs schematics))))


(main)
