(defun read-until-eof ()
  (loop for line = (read-line *standard-input* nil)
        while line
        do (format t "~A~%" line)))


(read-until-eof)
